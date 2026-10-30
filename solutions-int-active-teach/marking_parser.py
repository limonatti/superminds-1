import re,functools

def numbered(raw):
 s=' '.join(raw.split())
 m=re.match(r'(\d{1,2}[a-d]?|[a-zA-Z])\s+',s)
 if not m:return []
 first=m[1];numeric=first[0].isdigit();sub=numeric and first[-1].isalpha()
 pat=r'\d{1,2}[a-d]' if sub else r'\d{1,2}' if numeric else ('[a-z]' if first.islower() else '[A-Z]')
 ms=list(re.finditer(r'(?<!\S)('+pat+r')\s+',s))
 def rank(t):return int(t[:-1])*10+ord(t[-1])-97 if sub else int(t) if numeric else ord(t.lower())
 @functools.lru_cache(None)
 def solve(i):
  opts=[]
  for j in range(i+1,len(ms)):
   if rank(ms[j][1])<=rank(ms[i][1]):continue
   v=s[ms[i].end():ms[j].start()].strip()
   if not v:continue
   child=solve(j)
   # Numeric labels embedded in sentences usually break the consecutive sequence.
   penalty=abs(rank(ms[j][1])-rank(ms[i][1])-1)*.05
   opts.append((1+child[0]-penalty,[(ms[i][1],v)]+child[1]))
  tail=s[ms[i].end():].strip()
  if tail:opts.append((1,[(ms[i][1],tail)]))
  return max(opts,key=lambda a:a[0]) if opts else (0,[])
 return solve(0)[1]
