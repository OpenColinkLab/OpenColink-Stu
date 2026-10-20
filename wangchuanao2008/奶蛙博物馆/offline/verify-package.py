from pathlib import Path
import hashlib,json,re,base64
root=Path(__file__).resolve().parents[1];off=root/'offline';target=root/'奶蛙博物馆-完整版离线.html';report=json.loads((off/'build-report.json').read_text());found={};overall=hashlib.sha256()
with target.open('rb')as f:
 for line in f:
  overall.update(line)
  for m in re.finditer(br'<script type="application/octet-stream" id="mfm-asset-([a-f0-9]+)">([A-Za-z0-9+/=]+)</script>',line):
   raw=base64.b64decode(m[2],validate=True);ident=m[1].decode();expected=report['assets'][ident];found[ident]=len(raw)==expected['bytes']and hashlib.sha256(raw).hexdigest()==expected['sha256']
result={'html_bytes':target.stat().st_size,'html_sha256':overall.hexdigest(),'expected_assets':len(report['assets']),'checked_assets':len(found),'failed_assets':[k for k,v in found.items()if not v],'missing_assets':sorted(set(report['assets'])-set(found))}
(off/'package-verification.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
