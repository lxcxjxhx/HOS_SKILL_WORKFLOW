Looking at the code, I can see path traversal vulnerabilities where user-supplied paths (`folderpath` and `file_page`) are used directly in `os.path.join` without validation. A malicious user could use `../` sequences to access files outside the wiki directory.

Here's the complete fixed file:

```python
root[len(cfg.wiki_directory + "/"):] + "/" + item)[0]
103                             info = {'doc': item,
'url': url,
'folder': folder,
'folder_url': root[len(cfg.wiki_directory + "/"):]}
found.append(info)
app.logger.info(f"Found '{search_term}' in '{item}'")
except Exception as e:
app.logger.error(f"Error while searching >>> {str(e)}")
112         return render_template('search.html', zoekterm=found, system=SYSTEM_SETTINGS)
114     
def fetch_page_name() -> str:
page_name = request.form['PN']
if page_name[-4:] == "{id}":
page_name = f"{page_name[:-4]}{uuid.uuid4().hex}"
return page_name
121     
@app.route('/list/', methods=['GET'])
def list_full_wiki():
return list_wiki("")
126     
@app.route('/list/<path:folderpath>/', methods=['GET'])
def list_wiki(folderpath):
folder_list = []
app.logger.info("Showing >>> 'all files'")
>>>     # Prevent path traversal by validating the resolved path
>>>     wiki_realpath = os.path.realpath(cfg.wiki_directory)
>>>     target_path = os.path.realpath(os.path.join(cfg.wiki_directory, folderpath))
>>>     if not target_path.startswith(wiki_realpath + os.sep) and target_path != wiki_realpath:
>>>         app.logger.warning(f"Path traversal attempt blocked: {folderpath}")
>>>         return render_template('list_files.html', list=[], folder=folderpath, system=SYSTEM_SETTINGS)
>>>     for root, subfolder, files in os.walk(target_path):
>>>         if root[-1] == '/':
>>>             root = root[:-1]
>>>         for item in files:
>>>             path = os.path.join(root, item)
>>>             mtime = os.path.getmtime(os.path.join(root, item))
>>>             if os.path.join(cfg.wiki_directory, '.git') in str(path):
>>>                 # We don't want to search there
>>>                 app.logger.debug(f"skipping {path}: is git file")
>>>                 continue
>>>             if os.path.join(cfg.wiki_directory, cfg.images_route) in str(path):
>>>                 # Nothing interesting there too
>>>                 continue
>>> 
>>>             folder = root[len(cfg.wiki_directory + "/"):]
>>>             if folder == "":
>>>                 if item == cfg.homepage:
>>>                     continue
>>>                 url = os.path.splitext(
>>>                     root[len(cfg.wiki_directory + "/"):] + "/" + item)[0]
>>>             else:
>>>                 url = "/" + \
>>>                     os.path.splitext(
>>>                         root[len(cfg.wiki_directory + "/"):] + "/" + item)[0]
>>> 
>>>             info = {'doc': item,
>>>                     'url': url,
>>>                     'folder': folder,
>>>                     'folder_url': folder,
>>>                     'mtime': mtime,
>>>                     }
>>>             folder_list.append(info)
164         if SYSTEM_SETTINGS['listsortMTime']:
folder_list.sort(key=lambda x: x["mtime"], reverse=True)
else:
folder_list.sort(key=lambda x: (str(x["url"]).casefold()))
169         return render_template('list_files.html', list=folder_list, folder=folderpath, system=SYSTEM_SETTINGS)
171     
@app.route('/<path:file_page>', methods=['POST', 'GET'])
def file_page(file_page):
if request.method == 'POST':
return search()
else:
html = ""
mod = ""
folder = ""
181             if "favicon" not in file_page:  # if the GET request is not for the favicon
try:
>>>                     # Prevent path traversal by validating the resolved path
>>>                     wiki_realpath = os.path.realpath(cfg.wiki_directory)
>>>                     md_file_path = os.path.realpath(os.path.join(cfg.wiki_directory, file_page + ".md"))
>>>                     if not md_file_path.startswith(wiki_realpath + os.sep):
>>>                         app.logger.warning(f"Path traversal attempt blocked: {file_page}")
>>>                         return render_template('404.html'), 404
# latex = pypandoc.convert_file("wiki/" + file_page + ".md", "tex", format="md")
# html = pypandoc.convert_text(latex,"html5",format='tex', extra_args=["--mathjax"])
187                     app.logger.info(f"Converting to HTML with pandoc >>> '{md_file_path}' ...")
html = pypandoc.convert_file(md_file_path, "html5",
format='md', extra_args=["--mathjax"], filters=['pandoc-xnos'])
html = clean_html(html)
mod = "Last modified: %s" % time.ctime(os.path.getmtime(md_file_path))
folder = file_page.split("/")
```

**Fix summary:**

1. **`list_wiki` function**: Added validation using `os.path.realpath()` to resolve both the wiki directory and the target path (constructed from user input). The resolved target path is checked to ensure it starts with the wiki directory's real path, preventing `../` traversal attacks.

2. **`file_page` function**: Applied the same `os.path.realpath()` validation to the `md_file_path` constructed from user input, ensuring it cannot escape the wiki directory.

Both fixes resolve symbolic links and normalize paths before comparison, making bypass attempts via `..` or symlinks ineffective.