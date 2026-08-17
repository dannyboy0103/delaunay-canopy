# Delaunay Canopy 프로젝트 웹사이트 작업 인수인계 (web_process.md)

이 문서는 다른 맥북(또는 새 Claude Code 세션)에서 이 웹사이트 작업을 빠짐없이 이어가기 위한 핸드오프 기록이다.
Claude Code 세션 대화 맥락은 기기 간 동기화되지 않으므로, 새 환경에서는 이 파일을 먼저 읽고 시작한다.

작업 폴더는 `<홈>/Desktop/YONSEI/MICV/ECCV2026/delaunay-canopy-web/` 이다.
사용자명이 기기마다 다르다. 지금까지 확인된 것은 `/Users/donghyun/...` 과 `/Users/kimdonghyun/...` 두 가지다. 아래 경로 표기는 전부 홈 디렉토리 기준으로 읽으면 된다.

---

## 1. 목표

ECCV 2026 논문 "Delaunay Canopy: Building Wireframe Reconstruction from Airborne LiDAR Point Clouds via Delaunay Graph" 를 홍보하는 github.io 프로젝트 페이지를 만든다.

- 논문 camera-ready. `/Users/donghyun/Desktop/YONSEI/MICV/ECCV2026/_ECCV_2026_camera_ready__Delaunay_Canopy.pdf`
- supplementary. `/Users/donghyun/Desktop/YONSEI/MICV/ECCV2026/_ECCV_2026_camera_ready__Delaunay_Canopy_supp.pdf`
- 이 두 PDF는 사이트 폴더 안 `static/pdfs/Delaunay_Canopy.pdf`, `static/pdfs/Delaunay_Canopy_supp.pdf` 로 복사되어 Paper/Supplementary 버튼에 연결됨.

## 2. 참고한 레퍼런스 (사용자 제공)

- 사용자의 과거 사이트 (코드 베이스 예시). https://falcon-dehazing.github.io/, https://fdrep25.github.io/ (둘 다 Nerfies/Bulma 라이트 템플릿, fdrep는 Three.js .ply 뷰어 포함)
- 초기 이상형. https://dohunlee1.github.io/MemoryV2V/ (다크 커스텀)
- 최종 채택 디자인 방향. https://anttwo.github.io/surflo/ (이 사이트를 따라감)

surflo 디자인 핵심 (재현 대상)
- 완전 커스텀 다크 테마. 템플릿/Bulma 아님.
- near-black 배경, 얇은 Roboto(weight 100) 헤딩, JetBrains Mono 숫자/라벨, glass pill 버튼.
- 장치. IntersectionObserver scroll-reveal, gradient rule 애니메이션 섹션 헤더, 다크/라이트 테마 토글, before/after clip-path 비교 슬라이더, Three.js PLY 뷰어 캐러셀(orbit + auto-rotate가 grab 시 멈춤 + Normals 토글 + accent rim 조명), hero WebGL 회전 point cloud 배경, 탭 전환 CSS bar chart.

## 3. 확정된 디자인 결정 (사용자 승인)

- 디자인 베이스. surflo 스타일 풀 커스텀 다크 (Bulma 완전히 제거함).
- 색상 팔레트. Cyan + Magenta (논문 Fig.2/Fig.3의 dihedral BEV 컬러맵 cyan(0)~magenta(pi)와 일치).
  - accent cyan `#22d3ee` (rgb 34,211,238), 보조 magenta `#f472b6` (rgb 244,114,182).
  - 라이트 테마. accent `#0891b2`, 보조 `#be185d`.
  - 이 값들은 `static/css/style.css` 의 `:root` 와 `html[data-theme="light"]`, 그리고 `static/js/viewer.js` 상단 `ACCENT`/`LAV` 상수에 있음. 팔레트 바꾸려면 이 세 곳만 수정.
- 넣기로 한 fancy 장치. 3D PLY 뷰어 캐러셀, Hero WebGL 배경, before/after 비교 슬라이더, 테마 토글, 애니메이션 bar chart. (전부 구현됨)
- figure는 사용자가 PDF로 제공 -> `pdftoppm -png -r 300` 으로 PNG 변환 후 PIL로 흰 여백 crop -> 흰색 라운드 카드(`.figure.card`)로 감쌈. 카드는 상하좌우 동일 여백(padding 2%) + soft shadow.
- 헤더 버튼. Paper, Supplementary(아이콘은 Paper와 동일 fa-file-pdf), arXiv, Code(GitHub 로고). magnetic 커서 추적 효과는 끔.
- arXiv 링크. https://arxiv.org/abs/2604.02497 (연결됨). Code 버튼은 https://github.com/dannyboy0103/delaunay-canopy 로 연결됨.

## 4. 글쓰기 규칙 (CLAUDE.md, 사이트 산문에도 적용)

- 세미콜론, em-dash(—), 콜론(:) 사용 금지. 콤마/괄호/문장 재구성으로 처리.
  - 예외. 사용자가 Overview 헤더에 한해 하이픈 "-" 사용을 명시적으로 허용함 ("Overview - From point cloud to wireframe").
- 파일 저장은 프로젝트 디렉토리 내부에만. `/tmp` 금지.
- 사이트에 넣는 산문 문구 중 상당수는 Claude가 논문 기반으로 쓴 "의역"이다. 사용자는 가능하면 논문 원문 문장을 그대로 쓰는 것을 선호함. 새 문구를 넣을 때는 출처(논문 원문인지 의역인지)를 반드시 밝힐 것.

## 5. 저자 / 소속 정보 (논문 기준)

- 저자. Donghyun Kim(1,2), Chanyoung Kim(1,2), Youngjoong Kwon(2*), Seong Jae Hwang(1*).
  - 소속 상첨자는 콤마 유지(1,2). 교신저자 별표는 콤마 없이 붙임(2*, 1*). 별표는 accent 색.
  - 이름 사이는 콤마 없이 좌우 0.5em 여백(quad).
- 소속. (1) Yonsei University, (2) Emory University. (지역명 Seoul/Atlanta 등은 뺌, 학교 이름만.)
- meta 섹션 배열 순서(전부 중앙 정렬). 저자 -> affiliation -> corresponding authors -> venue(ECCV 2026 badge) -> 버튼.

## 6. 현재 파일 구조

```
delaunay-canopy-web/
  index.html                 메인 페이지 (섹션 전부 여기)
  README.md                  저장소 소개, 로컬 실행법, tools 설명
  web_process.md             이 문서
  .gitignore
  tools/
    prepare_models.py        Building3D txt/obj -> 웹용 ply/obj 변환기 (아래 13절)
    crop_aligned.py          같은 카메라로 뽑은 렌더 여러 장을 정렬 유지한 채 crop
  static/
    css/style.css            전체 디자인 시스템 (다크/라이트 토큰, 모든 컴포넌트)
    js/
      site.js                테마토글, scroll-reveal, magnetic(꺼둠), 복사버튼, Corner Score Sampling 애니메이션, Quantitative 차트, figure placeholder
      viewer.js              Three.js (ES module). hero pair 크로스페이드 + multi pane 뷰어 + 절차적 hip-roof fallback
    images/
      teaser.png                        Fig.1 teaser
      pipeline.png                      Fig.4 overall pipeline
      scoring.png                       Delaunay Graph Scoring 그림, 1600x570
      path_score.png                    Wire-Wise Path Score 그림, 856x810
      samp_6341_*.png                   Corner Score Sampling 용, 건물 6341, 822x736
      samp_41089_*.png                  같은 용도, 건물 41089, 1167x718
        key 는 pcd(입력 점구름), wf(GT wireframe), cs150/cs500(우리 샘플링), fps150/fps500
      raw/                              crop 전 원본 전부. sampling PNG 12장, figure 원본 PDF(overall, teaser, figuresforwebsite), teaser crop 전 백업
    models/                  b<건물번호>_<key>.<확장자>. key 는 뷰어의 data-items 키와 같다
      b33630_pc/wf           hero 배경용. 5249점, 24.9 x 26.0 x 6.4m
      b7926_pc/wf            Qualitative Results 1번 칸. 5487점, 26.4 x 23.7 x 5.8m
      b4941_pc/wf            Qualitative Results 2번 칸. 2193점, 13.2 x 12.8 x 4.6m
      b12262_pc/wf           Qualitative Results 3번 칸. 2851점, 16.4 x 18.3 x 6.9m
      b7114_pc/wf/bw         Interior Corners 1행. 1724점, 12.7 x 12.7 x 2.8m
      b29842_pc/wf/bw        Interior Corners 2행. 4333점, 20.6 x 16.0 x 6.8m
      b31132_pc/wf/bw        Interior Corners 3행. 1411점, 11.3 x 11.4 x 4.1m
      b42506_pc/wf           Complex Buildings 1번 칸. 1847점, 16.1 x 8.4 x 13.4m, wireframe vertex 212 edge 336
      raw/                   변환 전 원본 (UTM 절대좌표) 전부 보관
    pdfs/
      Delaunay_Canopy.pdf, Delaunay_Canopy_supp.pdf
```

외부 CDN 사용(자체 호스팅 아님). Google Fonts(Roboto, JetBrains Mono, Material Icons Outlined), Font Awesome 6.5.1, Academicons, MathJax v3, Three.js 0.160.0(importmap).

## 7. index.html 섹션 구성 (현재 상태)

순서대로.
1. Hero. **[완료, 2026-08-16]** 건물 하나의 pair(입력 point cloud + 복원 wireframe)가 회전하면서 서로 전환된다. surflo hero 를 참고했다.
   - DOM. `#hero-canvas` 에 `data-hero-pc`, `data-hero-wf`, `data-hero-up="z"` 속성.
   - 코드. `viewer.js` 상단 `HERO` 상수 객체에 튜닝값이 전부 모여 있다 (hold, fade, both, spin, fill, elevation, lookY, pointSize, lineWidth, pointColor).
   - 전환 타임라인. 단순 크로스페이드가 아니라 **들어오는 쪽이 먼저 켜지고 나가는 쪽이 나중에 꺼진다.** point cloud 단독 3초, wireframe 등장 0.8초, 둘 공존 1초, point cloud 퇴장 0.8초, wireframe 단독 3초, 그리고 역순. 한 주기 11.2초. `viewer.js` 의 `timeline` 배열이 그대로 이 순서다. 공존 구간 길이는 `HERO.both`.
   - 프레이밍. 회전하며 쓸고 지나가는 원기둥(footprint 대각선 반지름 + 높이)을 기준으로 카메라 거리를 매 resize 마다 푼다. `fill` 이 1.0 이면 가장 넓은 회전각에서 딱 맞고, 1.12 면 살짝 넘치게 꽉 찬다. 세로 화면(aspect<1)에서는 좌우로 더 넘치도록 최대 1.35배 더 당긴다.
   - 색. point cloud 는 높이에 따른 cyan-magenta 램프 (`HERO.pointColor='height'`, 논문 Fig.2/3 컬러맵과 같은 결). 다크 테마에서는 additive blending 으로 발광하듯 보이고 라이트 테마에서는 normal blending 으로 자동 전환된다. `'data'` 로 바꾸면 PLY 의 실제 LiDAR RGB, `'accent'` 는 단색.
   - wireframe 색. `HERO.lineColor = 'auto'` 다. 다크 테마에서 흰색, 라이트 테마에서 검정. 테마 토글을 누르면 `MutationObserver` 가 `data-theme` 변화를 잡아 즉시 바뀐다. `'accent'` 로 두면 CSS `--accent` 를 따라가고, 색 문자열을 직접 넣으면 그 값으로 고정된다.
   - 선 두께. `LineSegments2` + `LineMaterial` 을 써서 픽셀 단위 두께가 실제로 먹는다 (기본 `LineBasicMaterial` 은 linewidth 가 무시됨).
   - 접근성. `prefers-reduced-motion` 이면 회전과 전환을 멈추고 두 상태를 겹친 정지 화면을 보여준다.
   - 제목 "Delaunay Canopy", 부제 한 줄(데스크톱 nowrap). SCROLL 큐 제거함. ECCV eyebrow 제거함.
2. meta (`#meta`). 저자/소속/교신/venue/버튼. 중앙 정렬.
3. TL;DR (`#tldr`). 헤더 "TL;DR"(index-title, 큰 accent). statement 한 줄("Delaunay Canopy"는 accent, "Delaunay graph"는 italic). Fig.1 teaser(흰 카드). 논문 Fig.1 caption(첫 문장 뺌). TL;DR 카드 3개.
4. Overview (`#overview`). 헤더 "Overview - From point cloud to wireframe"(전체 accent). pipeline 그림(흰 카드, caption 없음). bullet 3개(scoring/corner/wire, 논문 원문 최대한 반영).
5. Delaunay Graph Scoring (`#scoring`). **[완료, 2026-08-17]** 도입 문단 + `scoring.png` 전체 폭 흰 카드 + 아래 2열로 Eq.1 dihedral angle, Eq.2 corner score. 그림이 Graph -> Edge-Wise Dihedral Angle -> Vertex-Wise Corner Score 3단계라서 아래 두 수식이 그림의 2, 3번째 칸에 대응한다. 3D 로 대체하려던 계획은 취소하고 사용자가 준 그림을 쓴다.
6. Corner Score Sampling (`#sampling`). **[완료, 2026-08-17]** 논문 Fig.5 에 대응한다. 칸 두 개로, 건물 6341 하나에 방법 두 개(우리 corner score sampling, FPS)다. 41089 는 사용자가 보고 뺐다 (`static/images/samp_41089_*.png` 는 남아 있으니 `data-buildings` 에 다시 넣으면 살아난다). 각 칸에서 입력 점구름(opacity 0.3)과 GT wireframe(0.55)을 항상 깔아두고, 그 위가 **Input point cloud -> 500 sampling points -> 150 sampling points** 세 단계로 자동 전환된다. 2.0초 유지, 0.9초 페이드, 한 주기 8.7초. 단계 이름은 칸 아래 가운데에 뜬다. 논문은 K 로 쓰지만 사이트에서는 변수 없이 풀어 쓰기로 했다 (사용자 요청). **루프는 앞으로만 돈다.** 샘플링은 점을 덜어내는 일이라 되감으면 점이 다시 자라나는 것처럼 보이기 때문이다. 마지막 단계에서 첫 단계로 접히는 것은 다시 시작하는 것으로 읽힌다. 두 칸이 시계 하나를 공유해서 항상 같은 단계에 있다. 오른쪽 아래에 현재 단계 이름이 표시된다.
   - 3D 가 아니라 **레이어로 겹친 PNG** 다. 12장이 전부 같은 카메라로 렌더된 투명 배경이라 정렬 작업이 필요 없다.
   - 코드는 `site.js` 의 `initSampling`, CSS 는 `.samp-*`. 마크업에 건물 목록, 방법 목록, 단계 목록을 주면 파일 이름을 조합해서 칸을 만든다. 단계는 `{"file":"...","label":"..."}` 이고 `file` 안의 `{m}` 이 방법 키로 치환된다. 그래서 `pcd` 처럼 방법과 무관한 단계와 `{m}500` 처럼 방법별인 단계를 섞을 수 있다. 건물이나 단계를 늘리면 격자와 타임라인이 따라간다.
   - 점구름만 흐름(flow) 안에 두고 나머지를 그 위에 절대 배치했다. 그래서 건물마다 자기 가로세로비를 유지한다.
   - `prefers-reduced-motion` 이면 K=150 상태로 정지.
   - 원본 파일명의 `15000`, `50000` 은 K=150, K=500 에 뷰 인덱스 `00` 이 붙은 것으로 읽었고 사용자가 확인해줬다. `41089_fos_50000.png` 는 `fps` 오타로 보고 `samp_41089_fps500.png` 로 넣었다.
6-1. Wire-Wise Path Score (`#wire`). **[완료, 2026-08-17]** 새로 만든 섹션이다. 2열로 왼쪽 `path_score.png` (흰 카드), 오른쪽 산문 + Eq.3 + prior-based query scaling 문단. 사용자 요청대로 글로 간략하게만 설명한다. 예전에는 이 내용이 Delaunay Graph Scoring 섹션 바닥에 얹혀 있었는데 독립 섹션으로 뺐다. 위치는 논문 3.2 순서를 따라 Corner Score Sampling 다음이다.

**그림 출처.** 첫 버전(`- website.jpg` 두 장)은 path score 범례에 글자가 없고 배경이 검정이라 폐기했다. 최종본은 `static/images/raw/figuresforwebsite.pdf` 다. 한 페이지에 두 figure 가 나란히 있고 위에 "For website" 라는 제목이 붙어 있어서, 잉크가 없는 행과 열의 띠를 찾아 제목을 떼고 좌우를 갈라 `scoring.png` (1600x570) 와 `path_score.png` (856x810) 로 뽑았다. 재작업할 일이 생기면 400dpi 로 렌더한 뒤 빈 열 띠(2279~2403 부근)를 경계로 자르면 된다. 2페이지는 1페이지와 완전히 동일한 사본이다.

7. Qualitative Results (`#results`). **[완료, 2026-08-17]** wipe 모드에 `data-sync="off"`. 건물 3개(7926, 4941, 12262)를 가로로 배열하고, 각 칸 안에서 슬라이드바를 좌우로 끌어 입력 point cloud 와 우리 결과를 갈아 보인다 (surflo 의 before/after 슬라이더와 같은 인터랙션이지만 이미지가 아니라 3D 다). 칸마다 따로 돌린다. 논문의 어느 그림도 아니고 결과 전시용이라 wireframe 을 accent 가 아니라 흰색/검정으로 둔다.
8. Recovering Interior Corners (`#interior`). **[UI 확정, 자산 대기]** 논문 Fig.7 에 대응한다. 건물 하나가 한 행이고 칸 두 개다. 왼쪽 칸은 입력 point cloud, 오른쪽 칸은 BWFormer 와 Ours 가 슬라이드바로 공존한다. 같은 자리에서 선이 바뀌므로 논문의 orange box 가 말하는 내부 corner 가 생겼다 사라졌다 하는 게 보인다. `data-sync="sample"` 이라 같은 행의 두 칸은 같이 돌고 행끼리는 따로 논다. GT 칸은 사용자 결정으로 넣지 않았다. **[완료, 2026-08-17]** 샘플 3개(7114, 29842, 31132) 전부 실제 데이터다.
9. Complex Buildings (`#complex`). **[완료, 2026-08-17]** 논문 Fig.8 에 대응한다. Qualitative Results 와 같은 wipe 배치이고 `data-sync="sample"`. 샘플은 42506 과 33630 두 개, 가로 2칸이다. case 이름(cluttered, occluded 등)은 사용자 결정으로 넣지 않는다. 33630 은 hero 배경과 같은 건물이라 페이지에 두 번 나온다.

**2026-08-17 섹션 삭제.** 논문 Fig.6 을 옮긴 Comparison with Prior Methods (7칸, Building3D/PointTransformer*/PointMeta*/BWFormer/Ours/GT) 를 통째로 뺐다. 사용자 결정이다. baseline 을 여러 개 늘어놓는 대신 BWFormer 와의 비교 하나에 집중한다. 되살리려면 git 이 없으므로 이 문서의 기록을 보고 다시 만들어야 한다. 칸 구성은 Input Point Cloud, Building3D (PointNet) `pn`, PointTransformer* `ptr`, PointMeta* `pmt`, BWFormer `bw`, Ours `wf`, Ground Truth `gt` 였고 건물 탭은 Sparse, Noisy, Low curvature 세 개였다.

**2026-08-17 배치 변경.** 원래 Interactive 3D(결과 전시)와 Qualitative(비교)가 Corner Score Sampling 을 사이에 두고 떨어져 있었다. 논문 목차 순서를 그대로 옮긴 탓이다. Corner Score Sampling 을 Delaunay Graph Scoring 바로 뒤로 올려서 방법과 결과를 묶었고, qualitative 를 사용자 제안대로 성격이 다른 네 섹션으로 쪼갰다. 옛 `#viewer` 섹션(캐러셀 두 개)과 옛 `#qualitative` 섹션(이미지 비교 슬라이더 두 개 + Fig.8 이미지)은 제거했고, `viewer.js` 의 `buildViewer`, `frameObject` 도 같이 지웠다.

**아직 데이터가 없는 섹션은 절차적 fallback 건물이 뜨고 아래에 `placeholder geometry, awaiting data` 라고 표시된다.** 진짜 데이터가 들어오면 이 문구는 자동으로 사라진다.
10. Quantitative Results (`#quant`). **[완료, 2026-08-17 전면 개편]** 평가 세팅 버튼 4개, 지표 차트 8개를 3행 격자로. 자산 불필요. 자세한 것은 12절.
10. Citation (`#citation`). BibTeX + 복사 버튼.
11. Footer.

## 7-1. multi-viewer 컴포넌트 (qualitative 네 섹션이 전부 이걸 쓴다)

`viewer.js` 의 `buildMultiViewer`, CSS 는 `.multi-stage` 계열, 튜닝값은 `MULTI` 상수 객체에 모여 있다.

핵심 구조. **캔버스 하나에 viewport 를 N개 그리고 카메라 하나를 공유한다.** 칸마다 WebGL 컨텍스트를 만들어 카메라를 동기화하는 방식이 아니라, 애초에 같은 카메라라서 어긋날 수가 없다. 칸 사이의 18px 은 아무것도 그리지 않고 비워서 stage 배경이 비친다. 칸 테두리와 라벨은 canvas 위에 얹은 그냥 DOM 이고 위치는 JS 가 잡는다.

**칸(cell)이 기본 단위다. 한 칸에 pane 을 하나 넣으면 그냥 뷰, 두 개 넣으면 슬라이드바로 갈아 보는 wipe 칸이 된다.**
- **wipe 구현 요점.** 두 pane 이 viewport 는 칸 전체로 똑같이 두고 scissor 사각형만 좌우로 나눈다. 투영이 완전히 동일하므로 경계선에서 형태가 어긋나지 않는다. 이미지 두 장을 clip-path 로 자르는 흔한 방식과 달리 실제 3D 라서 돌려도 계속 맞는다.
- 슬라이드바(`.mv-wipe`)는 칸 위에 얹은 DOM 이라, 잡고 끌어도 아래의 orbit 컨트롤로 이벤트가 가지 않는다. 칸의 다른 곳을 끌면 회전한다.
- pane 이름은 슬라이드바에서 끝나는 클리핑 상자(`.mv-clip`) 안에 있어서, 슬라이더가 이름 위를 지나가면 그 이름이 잘려 사라진다.

**데이터를 먹이는 방법이 두 가지다.**
- `data-cells`. 칸 묶음을 정의하면 **그 묶음이 건물마다 반복된다.** 기본 배치는 한 건물이 한 행이다. qualitative 섹션들이 쓴다. 탭은 없다.
- `data-panes` (구식). pane 하나가 칸 하나가 되고, 한 번에 건물 하나만 보이며 아래 탭으로 전환한다. **지금 이걸 쓰는 섹션은 없다.** 나중에 여러 baseline 을 한 줄로 늘어놓는 배치가 다시 필요해지면 쓰면 된다.
- `data-items` 의 `name` 은 `data-cells` 모드에서 그 건물의 첫 칸 왼쪽 위에 caption 으로 붙는다 (`.mv-title`). 이름을 빼면 아무것도 안 나온다. **지금은 어느 섹션도 쓰지 않는다.** 사용자가 건물 번호도 case 이름도 화면에 띄우지 않기로 했다.

전부 마크업으로 설정한다.
```html
<div class="multi-viewer"
     data-sync="sample" data-up="z" data-cols="2" data-cols-narrow="1" data-cell-aspect="1.45"
     data-cells='[
       [ {"label":"Input Point Cloud","key":"pc","kind":"points"} ],
       [ {"label":"BWFormer","key":"bw","kind":"wireframe"},
         {"label":"Ours","key":"wf","kind":"wireframe","accent":true} ]
     ]'
     data-items='[{"pc":"...ply","bw":"...obj","wf":"...obj"}, {...}, {...}]'></div>
```
위 예시가 Recovering Interior Corners 섹션이다. 건물 하나가 한 행이고, 왼쪽 칸에 입력, 오른쪽 칸에 BWFormer 와 Ours 가 슬라이드바로 공존한다.
- `kind` 는 `points` 또는 `wireframe`.
- `key` 는 `data-items` 항목의 필드 이름이다. 칸을 하나 늘리려면 `data-panes` 에 한 줄, 각 항목에 URL 하나만 추가하면 된다.
- `accent: true` 인 칸은 라벨이 accent 색이 되고 선이 살짝 두꺼워진다. 우리 결과를 표시하는 용도다.
- `color` 로 칸별 선 색을 지정한다. `auto` 는 hero 와 같은 규칙으로 다크 테마 흰색, 라이트 테마 검정. `accent` 는 CSS `--accent` 를 따라간다. 색 문자열을 직접 넣어도 된다. 지정하지 않으면 `accent: true` 인 칸은 accent, 나머지는 `auto` 다.
  - Qualitative Results 는 비교 대상이 없으므로 `"color":"auto"` 로 흰색/검정을 쓴다. baseline 과 나란히 놓이는 Comparison 과 Interior 섹션에서는 우리 결과만 accent 로 두어 구분한다.
- `data-cols` 는 넓은 화면에서의 열 개수, `data-cols-narrow` 는 좁은 화면(760px 미만)에서의 열 개수다. 행 수는 자동이고 stage 높이도 격자 모양에서 자동으로 나온다. `data-cell-aspect` 로 칸 하나의 가로세로비를 조절한다 (기본 1.1).
- `data-sync` 로 조종 방식을 정한다. 코드에서는 카메라 하나와 그에 붙은 컨트롤들을 묶어 rig 라고 부른다. rig 하나에 컨트롤이 여러 개 붙을 수 있고 (칸마다 하나씩), 전부 같은 카메라와 같은 target 객체를 공유한다. 자동 회전은 그중 첫 번째에만 걸어둔다. 안 그러면 붙은 개수만큼 빨리 돌아간다.
  - `on` (기본). 모든 칸이 rig 하나를 공유한다. 컨트롤은 캔버스 전체에 붙는다. 카메라 거리는 가장 큰 건물에 맞춘다.
  - `sample`. 건물 하나가 rig 하나다. 같은 건물의 칸들은 같이 돌고 건물끼리는 따로 논다. 비교 섹션에서 이게 맞다. 한 건물의 입력과 결과가 각도가 다르면 비교가 성립하지 않고, 옆 건물까지 같이 돌 이유는 없기 때문이다. Qualitative Results 와 Recovering Interior Corners 가 쓴다.
  - `off`. 칸마다 rig 를 따로 둔다.
  - `sample` 과 `off` 는 컨트롤이 그 칸의 frame 요소에 붙는다 (`.mv-cell.is-interactive`). 카메라 거리도 자기 건물에 맞춰 따로 계산하므로, 작은 건물과 큰 건물이 각 칸에서 비슷한 크기로 보인다.

동작 세부
- 칸 정규화는 **모든 칸의 합집합 bounding box 하나로** 계산해서 전부에 똑같이 적용한다. 그래서 한 칸의 어느 지점이 옆 칸 같은 자리에 온다.
- 건물 탭은 항목이 2개 이상일 때만 보인다.
- 자동 회전은 손대는 순간 멈추고, 그 뒤로는 리사이즈나 건물 전환에도 사용자가 잡은 각도를 유지한다.
- 한 칸이라도 파일이 없으면 모든 칸이 절차적 fallback 건물로 떨어지고 `placeholder geometry, awaiting data` 문구가 뜬다. 일부만 진짜 데이터면 스케일이 안 맞아서 일부러 전부 떨어뜨린다.
- 760px 기준값은 `MULTI.narrowBelow` 에 있다.

## 8. 섹션 헤더 스타일 (현재 혼재, 통일 미정)

- TL;DR. `index-title` (번호 없이 이름만, 큰 accent 제목).
- Overview. `h2.header-inline` (이름 - 부제, 전체 accent).
- 나머지(Delaunay Graph Scoring 등). `div.index`(작은 mono) + 별도 `h2` 큰 제목의 옛 구조.
- 인덱스 번호(00,01...)는 전부 제거함.
- TODO. 나머지 섹션 헤더를 어떤 스타일로 통일할지 미정. 사용자와 섹션별로 진행 중.

## 9. 진행 방식 (사용자 요청)

- 섹션을 하나씩 완성하며 진행한다. 다음 섹션으로 넘어갈 때마다 사용자에게 확인받는다.
- figure는 사용자가 PDF로 준다. 받으면 PNG 변환(300dpi) + 흰 여백 crop + 흰 카드 적용.
- 문구는 최대한 논문 원문. 새 문구는 출처 명시.

## 10. 방향 전환 (2026-08-16) 과 남은 작업

**2D figure 대신 3D 인터랙션 중심으로 간다.** 사용자 결정이다.
- 2D 이미지로 남기는 것은 teaser (Fig.1) 와 pipeline (Fig.4) 둘뿐이다.
- 결과 figure (Fig.3 scoring BEV, Fig.5 sampling, Fig.7/8 qualitative) 는 전부 3D 뷰어로 대체한다.
- 잘못 생성됐던 `scoring.png` 는 삭제했다. before/after 이미지 슬라이더 계획도 폐기 후보다.
- 뷰어 엔진(`buildViewer`)은 한 번에 통째로 고치지 않는다. **섹션마다 필요한 UI 가 다르므로 세션마다 사용자와 UI 를 먼저 의논하고 그때 엔진을 확장한다.** (사용자 명시 요청)

세션 진행 상황
- [완료] Hero. pair 크로스페이드. 7절 1번 참고.
- [완료] qualitative 네 섹션의 구조와 제목. 7절 7~10번, 7-1절 참고. 전부 같은 multi-viewer 컴포넌트다. **이제 막힌 것은 코드가 아니라 데이터다.** 아래 13절의 키 표를 채우면 된다.
- [대기] Delaunay Graph Scoring 3D. dihedral angle 로 칠한 Delaunay mesh + corner score 로 칠한 point cloud.
- [대기] Corner Score Sampling 3D. Ours(K=150) vs FPS(K=150) 토글, GT wireframe 겹침.
- [완료] Quantitative 개편. 12절 참고.
- [대기] supplementary 의 Tokyo LoD2 cross-dataset 결과(supp Table 3, 4)를 다섯 번째 버튼으로 넣을지 미정.
- [완료] 배포. 10-1절 참고.
- [완료] 섹션 헤더 스타일 통일. 모든 섹션이 `h2.header-inline` accent 한 줄로 통일됐다 (TL;DR 만 `index-title` 유지).

미정/확인 필요
- 각 섹션 caption/문구 최종 확정(대부분 아직 Claude 의역 상태).
- `raw/33630_o.txt` 의 8번째 열이 무엇인지 (0.29~1.0 스칼라). 6번째 열은 intensity 로 보인다. 3~5열이 rgb.
- 기존 `#viewer`, `#sampling`, `#qualitative` 섹션의 옛 마크업(캐러셀, 비교 슬라이더)은 아직 index.html 에 남아 있다. 각 섹션 세션에서 교체될 예정.

## 10-1. 배포 (2026-08-17)

**공개됨.** <https://dannyboy0103.github.io/delaunay-canopy/>
저장소 <https://github.com/dannyboy0103/delaunay-canopy> (public, GitHub Pages 는 main 브랜치 루트).

- 계정은 `dannyboy0103`. `gh` CLI 로 로그인되어 있다.
- 배포는 그냥 push 다. main 에 올리면 Pages 가 다시 빌드한다. 첫 빌드는 `errored` 로 몇 번 뜨다가 1분쯤 뒤 `built` 이 됐다. 상태 확인은 `gh api repos/dannyboy0103/delaunay-canopy/pages --jq '.status'`.
- 헤더의 Code 버튼이 이 저장소를 가리킨다.
- `README.md` 를 새로 썼다. 로컬 실행법, 폴더 구조, `tools/` 두 스크립트 설명이 들어 있다.

**PDF 를 압축해서 올렸다.** 원본은 내부 이미지가 2956ppi 라 본문 32.6MB, supplementary 15.1MB 였다. ghostscript 로 이미지를 200dpi 로 낮춰 각각 2.3MB, 2.5MB 가 됐다. 12쪽(Fig.6 이 있는 이미지 많은 쪽)을 렌더해서 대조했고 글자와 그림 모두 깨끗했다. 저장소 전체는 62MB 에서 19MB 가 됐다.
```
gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.5 -dNOPAUSE -dQUIET -dBATCH \
   -dDetectDuplicateImages=true \
   -dDownsampleColorImages=true -dColorImageResolution=200 -dColorImageDownsampleType=/Bicubic \
   -dDownsampleGrayImages=true -dGrayImageResolution=200 -dGrayImageDownsampleType=/Bicubic \
   -dDownsampleMonoImages=true -dMonoImageResolution=600 \
   -sOutputFile=out.pdf in.pdf
```
**압축 안 된 원본은 저장소 바깥, 프로젝트 상위 폴더의 `_ECCV_2026_camera_ready__*.pdf` 에 그대로 있다.** 사이트용 PDF 를 다시 만들 일이 생기면 그것을 압축하면 된다.

figure 원본 PDF(`overall.pdf`, `teaser.pdf`)와 crop 전 백업은 `static/images/raw/` 로 옮겼다.

## 11. 로컬 미리보기 방법

```
cd /Users/donghyun/Desktop/YONSEI/MICV/ECCV2026/delaunay-canopy-web
python3 -m http.server 8123
```
브라우저에서 http://localhost:8123 접속. (Three.js importmap 모듈 로딩 때문에 file:// 직접 열기 말고 반드시 http 서버로 볼 것.)

PDF -> PNG 변환 레시피 (figure 추가 시)
```
pdftoppm -png -r 300 -singlefile input.pdf out_raw
python3 -c "from PIL import Image, ImageChops; im=Image.open('out_raw.png').convert('RGB'); bg=Image.new('RGB',im.size,(255,255,255)); im.crop(ImageChops.difference(im,bg).getbbox()).save('out.png')"
```
필요 도구. `pdftoppm`(poppler), `python3 + Pillow(PIL)`. 새 기기에 없으면 `brew install poppler`, `pip3 install Pillow`.

## 12. Quantitative 섹션 (2026-08-17 전면 개편)

`#quant` 섹션이다. 헤더를 다른 섹션과 같은 `h2.header-inline` 스타일의 "Quantitative Results" 로 바꿨다.

**버튼 4개 (평가 세팅).** 지표 탭은 없앴다. 8개 지표를 한 번에 다 보여주기 때문이다.
1. Tallinn City. 본문 Table 1 왼쪽 절반.
2. Entry-Level. 본문 Table 1 오른쪽 절반.
3. Official Leaderboard. supplementary Table 1. 공식 Building3D 리더보드 프로토콜.
4. 5-Fold Cross-Validation. supplementary Table 2.

**배치 3행.** 각 칸이 지표 하나의 작은 막대 차트다.
- 1행 Distance 2개. WED, ACO. (`.quant-row-2`, 폭을 반씩)
- 2행 Corner 3개. CP, CR, CF1.
- 3행 Wire 3개. EP, ER, EF1.

**막대 스케일. 막대 길이는 항상 값 자체를 나타낸다. 순위가 아니다.** 높을수록 좋은 지표는 값이 곧 퍼센트라 그대로 쓴다. 낮을수록 좋은 지표(WED, ACO)는 그 차트의 최대값으로 나눈다(`v / worst`). 그래서 **1등이 가장 짧은 막대**가 된다. 어느 쪽이 좋은지는 막대 길이가 아니라 카드 헤더의 `higher/lower is better` 와 1등 표시로 읽는다.

**PC2WF 전면 제외 (사용자 결정).** 값에 비례하는 막대를 쓰면 이상치 하나가 스케일을 다 잡아먹는다. PC2WF 의 WED 0.554 가 나머지 여덟 개(0.232~0.264)를 전부 비슷한 길이로 뭉갰고, Corner Precision 21.4, Wire F1 4.8 처럼 다른 지표에서도 혼자 바닥이었다. 그래서 **네 표 모두에서 PC2WF 행을 뺐다.** 이제 세 표는 방법 8개, 리더보드는 8개다. 값에 비례하지 않는 스케일(순위 정규화, 0이 아닌 기준선)을 쓰면 막대가 거짓말을 하게 되므로 0 기준 비례는 유지한다.

논문 표에는 PC2WF 가 있으므로 **사이트가 표의 부분집합**임을 기억할 것. 되살리려면 site.js 의 해당 `QUANT.data` 배열에 아래 행을 다시 넣으면 된다.
```
Tallinn City   PC2WF  WED 0.554 ACO 0.508 CP 21.4 CR 50.5 CF1 30.1 EP 2.8 ER 16.7 EF1 4.8
Entry-Level    PC2WF  WED 0.490 ACO 0.422 CP 28.5 CR 16.3 CF1 20.7 EP 3.1 ER 19.1 EF1 5.3
Leaderboard    PC2WF  WED null  ACO 0.520 CP 18.0 CR 67.0 CF1 28.0 EP 2.0 ER 15.0 EF1 1.0
5-Fold         PC2WF  WED 0.548 ACO 0.512 CP 21.9 CR 50.1 CF1 30.4 EP 3.1 ER 16.5 EF1 5.3
```

**정직성.** 우리 결과는 accent 색으로 표시하되, 각 지표의 1등에는 그와 별개로 `is-best` 표시가 붙는다. 그래서 우리가 1등이 아닌 칸도 그대로 드러난다. 실제로 그런 칸이 셋 있다.
- Official Leaderboard 의 ACO. BWFormer 0.204 < 우리 0.206.
- Official Leaderboard 의 CP 와 EP. PBWR 이 98.5, 94.3 으로 최고.
- 5-Fold 의 WED (BWFormer 0.248 < 우리 0.250) 와 CR (BWFormer 80.5 > 우리 79.9).
- 본문 Tallinn 의 ER 도 BWFormer 74.6 > 우리 74.0 이다.

**수치 검증.** site.js 의 `QUANT.data` 4개 표 36행을 PDF 원문에서 뽑아 전부 대조했다. 표를 수정하면 다시 대조할 것.

**표기.** 논문과 같이 단검표(†)와 별표(*)를 그대로 쓴다. site.js 와 index.html 모두 UTF-8 이고 index.html 에 `<meta charset="utf-8">` 이 있어서 그대로 렌더된다. 각주 설명은 버튼을 누를 때마다 바뀌는 `#quant-note` 에 들어 있다.

## 12-1. Table 1 정량 수치 (참고용 요약)

Tallinn City / Entry-Level, 각 지표. Delaunay Canopy가 대부분 최고. 단 Tallinn ER은 BWFormer 74.6 > Ours 74.0 (유일 예외). "state of the art" 표현 시 참고.
Delaunay Canopy. Tallinn CP94.5 CF1 88.3 EF1 80.0 WED0.232 / Entry CP95.1 CF1 90.2 EF1 82.4 WED0.230.
BWFormer(previous best). Tallinn CP91.4 CF1 85.4 EF1 79.1 WED0.245 / Entry CP92.4 CF1 87.3 EF1 81.1 WED0.242.
전체 표는 site.js의 QUANT 객체에 있음.

## 13. 3D 자산 규격 (사용자가 export 할 때)

**중요. 원본 좌표를 그대로 웹에 넣으면 안 된다.** Building3D 는 UTM 절대좌표라 x 가 5.4e5, y 가 6.6e6 수준인데, Three.js 는 위치를 float32 로 저장하므로 6.6e6 근처의 간격이 약 0.5m 다. 형태가 그대로 뭉개진다. 그래서 `tools/prepare_models.py` 가 **point cloud 와 wireframe 에서 같은 원점을 빼고** 내보낸다. 원점은 두 파일의 주석에 기록된다.

사용자가 주면 되는 것 (원본 그대로, 변환은 내가 함)
- point cloud. Building3D 텍스트 형식. 공백 구분 `x y z r g b [intensity ...]`. 6열이든 8열이든 앞의 6개만 읽으므로 그대로 주면 된다.
- wireframe. OBJ 에 `v` 줄과 엣지마다 `l i j` 한 줄. face 없어도 된다. (`f` 가 있으면 스크립트가 테두리 엣지로 변환한다.)
- 같은 건물의 두 파일은 좌표계와 스케일이 동일해야 한다. 각각 따로 정규화하면 안 된다.
- 좌표축은 Z-up 이다 (z 가 높이). 뷰어에서 `data-hero-up="z"` 로 처리한다.

변환 명령
```
cd <홈>/Desktop/YONSEI/MICV/ECCV2026/delaunay-canopy-web
python3 tools/prepare_models.py --txt 7114.txt --out-dir static/models --name b7114 \
    --wf wf=7114_origin.obj --wf bw=7114_200.obj
```
**wireframe 이 여러 개면 반드시 한 번에 돌린다.** `--wf` 를 여러 번 주면 point cloud 와 모든 wireframe 에서 **같은 원점**을 빼므로 서로 겹쳐진다. 따로 돌리면 원점이 달라져서 어긋난다.

**이름 규칙.** `--name b<건물번호>`, `--wf <key>=<경로>` 의 key 는 뷰어 `data-items` 의 키와 같은 것을 쓴다. 위 예시는 `b7114_pc.ply`, `b7114_wf.obj`, `b7114_bw.obj` 를 낸다. hero 도 별도 파일을 두지 않고 이 중 하나를 `index.html` 의 `data-hero-pc`/`data-hero-wf` 로 가리킨다. 원본은 `static/models/raw/` 에 보관한다.

지금까지 확인된 원본 이름 규칙 (사용자 export 기준). `<id>.txt` 또는 `<id>_raw.txt` 가 point cloud, `<id>_origin.obj` 가 우리 결과, `<id>_200.obj` 가 BWFormer 결과다.
스크립트는 표준 라이브러리만 쓴다. numpy 불필요.

참고 수치 (건물 33630). 크기 24.9m x 26.0m x 6.4m, 점 5249개, PLY 77KB.

### 섹션별로 필요한 파일 (multi-viewer 의 key 와 1대1)

| key | 뜻 | 형식 |
|---|---|---|
| `pc` | 입력 point cloud | txt -> ply |
| `wf` | 우리 결과 wireframe | obj |
| `gt` | 정답 wireframe | obj |
| `bw` | BWFormer 결과 | obj |
| `pn` | Building3D (PointNet) 결과 | obj |
| `ptr` | PointTransformer* 결과 | obj |
| `pmt` | PointMeta* 결과 | obj |

| 섹션 | 필요한 key | 건물 수 | 비고 |
|---|---|---|---|
| Qualitative Results | pc, wf | 3~5 | 33630 하나 확보 |
| Comparison with Prior Methods | pc, pn, ptr, pmt, bw, wf, gt | 3 | 논문 Fig.6 의 sparse / noisy / low curvature 행에 쓴 건물 |
| Recovering Interior Corners | pc, bw, wf, gt | 2 | 논문 Fig.7 에 쓴 건물 |
| Complex Buildings | pc, wf | 3 | 논문 Fig.8 의 (a) cluttered, (b) occluded, (c) highly complex |

같은 건물이 여러 섹션에 나와도 상관없다. 파일은 건물 번호로 한 벌만 두고 각 섹션이 참조하면 된다.
baseline 결과(pn, ptr, pmt, bw)를 다시 뽑기 어려우면 Comparison 섹션의 칸을 줄이면 된다. `data-panes` 에서 해당 줄만 빼면 그만이다.
