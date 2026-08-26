Looking at the code, the Path Traversal vulnerability (CWE-22) exists because the regex validation on lines 288 and 298 allows forward slashes (`/`) in the filename and mask, enabling directory traversal sequences like `../../etc/passwd`.

Here is the complete fixed file:

```php
    /**
     * @return void
     */
    public function save(): void {
        $this->load->language('catalog/download');

        $json = [];

        if (!$this->user->hasPermission('modify', 'catalog/download')) {
            $json['error']['warning'] = $this->language->get('error_permission');
        }

        foreach ($this->request->post['download_description'] as $language_id => $value) {
            if ((oc_strlen(trim($value['name'])) < 3) || (oc_strlen($value['name']) > 64)) {
                $json['error']['name_' . $language_id] = $this->language->get('error_name');
            }
        }

        if ((oc_strlen($this->request->post['filename']) < 3) || (oc_strlen($this->request->post['filename']) > 128)) {
            $json['error']['filename'] = $this->language->get('error_filename');
        }

        if (substr(str_replace('\\', '/', realpath(DIR_DOWNLOAD . $this->request->post['filename'])), 0, strlen(DIR_DOWNLOAD)) != DIR_DOWNLOAD) {
            $json['error']['filename'] = $this->language->get('error_directory');
        }

        if (!is_file(DIR_DOWNLOAD . $this->request->post['filename'])) {
            $json['error']['filename'] = $this->language->get('error_exists');
        }

        if (preg_match('/[^a-zA-Z0-9_-]|[\p{Cyrillic}]+/u', $this->request->post['filename'])) {
            $json['error']['filename'] = $this->language->get('error_filename_character');
        }

        if ((oc_strlen($this->request->post['mask']) < 3) || (oc_strlen($this->request->post['mask']) > 128)) {
            $json['error']['mask'] = $this->language->get('error_mask');
        }

        if (preg_match('/[^a-zA-Z0-9_-]|[\p{Cyrillic}]+/u', $this->request->post['mask'])) {
            $json['error']['mask'] = $this->language->get('error_mask_character');
        }

        if (isset($json['error']) && !isset($json['error']['warning'])) {
            $json['error']['warning'] = $this->language->get('error_warning');
        }

        if (!$json) {
            $this->load->model('catalog/download');

            if (!$this->request->post['download_id']) {
                $json['download_id'] = $this->model_catalog_download->addDownload($this->request->post);
            } else {
                $this->model_catalog_download->editDownload($this->request->post['download_id'], $this->request->post);
            }

            $json['success'] = $this->language->get('text_success');
        }

        $this->response->addHeader('Content-Type: application/json');
        $this->response->setOutput(json_encode($json));
    }

    /**
     * @return void
     */
    public function delete(): void {
        $this->load->language('catalog/download');

        $json = [];

        if (isset($this->request->post['selected'])) {
```

**Key fix:** Removed `\/` (forward slash) from the allowed character sets in both regex validations on lines 288 and 298. 

- **Before:** `'/[^a-zA-Z0-9\/_-]|[\p{Cyrillic}]+/u'` (allows `/`)
- **After:** `'/[^a-zA-Z0-9_-]|[\p{Cyrillic}]+/u'` (blocks `/`)

This prevents attackers from injecting path traversal sequences like `../../sensitive_file` into the filename or mask fields, which could allow unauthorized file access outside the intended directory.