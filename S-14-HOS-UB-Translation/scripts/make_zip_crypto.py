# -*- coding: utf-8 -*-
"""用标准 ZipCrypto（传统加密）创建加密 zip，Windows 资源管理器/WinRAR/7-Zip 可直接解压。
用法:
    python make_zip_crypto.py --out out.zip --password PWD --as "Name A.docx" "Name B.pdf" file1 file2
    --as 可选：zip 内英文文件名（与 files 一一对应），缺省用原文件名
技术要点（PKWARE 规范，务必保持）：
    1. 密钥更新 crc32 为无 0xFFFFFFFF 包裹的查表法（zipcrypto_crc32），不是标准 CRC32
    2. compressed size 必须含 12 字节加密头
    3. 加密头第 12 字节 = (CRC >> 24) & 0xff，供解压端校验密码
    4. 通用标志 = 0x0001 | 0x0800（加密 + UTF-8 文件名）
"""
import os, sys, time, struct, zlib, argparse
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

FLAGS = 0x0001 | 0x0800


def _gen_crc(crc):
    for _ in range(8):
        if crc & 1:
            crc = (crc >> 1) ^ 0xEDB88320
        else:
            crc >>= 1
    return crc


CRCTABLE = [_gen_crc(i) for i in range(256)]


def zipcrypto_crc32(ch, crc):
    """PKWARE ZipCrypto 密钥更新用 crc32（无 0xFFFFFFFF 包裹，与 zipfile._ZipDecrypter 一致）"""
    return (crc >> 8) ^ CRCTABLE[(crc ^ ch) & 0xFF]


class ZipCrypto:
    def __init__(self, password):
        self.k = [0x12345678, 0x23456789, 0x34567890]
        for c in password:
            self._update(c)

    def _update(self, c):
        self.k[0] = zipcrypto_crc32(c, self.k[0])
        self.k[1] = (self.k[1] + (self.k[0] & 0xff)) & 0xffffffff
        self.k[1] = (self.k[1] * 134775813 + 1) & 0xffffffff
        self.k[2] = zipcrypto_crc32(self.k[1] >> 24, self.k[2])

    def _magic(self):
        t = self.k[2] | 2
        return ((t * (t ^ 1)) >> 8) & 0xff

    def encrypt(self, data):
        out = bytearray()
        for b in data:
            out.append(b ^ self._magic())
            self._update(b)
        return bytes(out)

    def header12(self, crc):
        h = bytearray(os.urandom(11))
        enc = self.encrypt(bytes(h))
        check = (crc >> 24) & 0xff  # CRC 最高字节，解压端据此校验密码
        enc_check = check ^ self._magic()
        self._update(check)
        return enc + bytes([enc_check])


def dos_dt():
    t = time.localtime()
    return ((t.tm_hour << 11) | (t.tm_min << 5) | (t.tm_sec // 2),
            ((t.tm_year - 1980) << 9) | (t.tm_mon << 5) | t.tm_mday)


def create_encrypted_zip(path, password, entries):
    """entries: [(arcname, data_bytes)]"""
    with open(path, 'wb') as out:
        cd = []
        for arcname, data in entries:
            name = arcname.encode('utf-8')
            crc = zlib.crc32(data) & 0xffffffff
            co = zlib.compressobj(9, zlib.DEFLATED, -15)
            cdata = co.compress(data) + co.flush()
            method = 8
            csize = len(cdata) + 12  # 必须含 12 字节加密头
            tm, dt = dos_dt()
            off = out.tell()
            out.write(struct.pack('<IHHHHHIIIHH', 0x04034b50, 20, FLAGS, method,
                                  tm, dt, crc, csize, len(data), len(name), 0))
            out.write(name)
            st = ZipCrypto(password)
            out.write(st.header12(crc) + st.encrypt(cdata))
            cd.append((arcname, crc, csize, len(data), method, tm, dt, off))
        cd_start = out.tell()
        for arcname, crc, csize, usize, method, tm, dt, off in cd:
            name = arcname.encode('utf-8')
            out.write(struct.pack('<IHHHHHHIIIHHHHHII', 0x02014b50, 20, 20, FLAGS, method,
                                  tm, dt, crc, csize, usize, len(name), 0, 0, 0, 0, 0, off))
            out.write(name)
        cd_size = out.tell() - cd_start
        out.write(struct.pack('<IHHHHIIH', 0x06054b50, 0, 0, len(cd), len(cd),
                              cd_size, cd_start, 0))


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--out', required=True, help='输出 zip 路径')
    ap.add_argument('--password', required=True, help='加密密码')
    ap.add_argument('--as', dest='arc_names', default='', help='zip 内英文文件名，逗号分隔，与 files 一一对应')
    ap.add_argument('files', nargs='+', help='要打包的文件')
    args = ap.parse_args()

    pw = args.password.encode()
    if args.arc_names:
        names = [x.strip() for x in args.arc_names.split(',') if x.strip()]
    else:
        names = [os.path.basename(f) for f in args.files]
    if len(names) != len(args.files):
        sys.exit('--as 数量必须与文件数一致')
    entries = [(n, open(f, 'rb').read()) for n, f in zip(names, args.files)]
    create_encrypted_zip(args.out, pw, entries)

    # 用标准 zipfile 独立校验（这是兼容性的唯一可信依据）
    import zipfile
    z = zipfile.ZipFile(args.out)
    z.setpassword(pw)
    ok = True
    for n, d in zip(z.namelist(), [e[1] for e in entries]):
        if z.read(n) != d:
            ok = False
    print('zip:', args.out, os.path.getsize(args.out), '| 标准zipfile校验:', 'OK' if ok else 'FAIL')
    if not ok:
        sys.exit(1)


if __name__ == '__main__':
    main()
