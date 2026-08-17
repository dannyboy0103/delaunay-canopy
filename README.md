# Delaunay Canopy, project page

Project page for the ECCV 2026 paper **Delaunay Canopy: Building Wireframe
Reconstruction from Airborne LiDAR Point Clouds via Delaunay Graph**.

Live at <https://dannyboy0103.github.io/delaunay-canopy/>.

## Running it locally

The page loads Three.js as an ES module through an import map, so opening
`index.html` from the filesystem will not work. Serve it over http.

```
python3 -m http.server 8123
```

Then open <http://localhost:8123>.

## Layout

```
index.html            every section lives here
static/css/style.css  the whole design system, dark and light tokens
static/js/site.js     theme toggle, scroll reveal, sampling animation, charts
static/js/viewer.js   Three.js hero background and the multi pane 3D viewer
static/models/        point clouds as .ply and wireframes as .obj, raw/ keeps the sources
static/images/        figures, raw/ keeps what they were cut from
static/pdfs/          paper and supplementary
tools/                converters, see below
```

## Tools

`tools/prepare_models.py` turns Building3D data into what the viewer reads. The
raw coordinates are absolute UTM, and Three.js stores positions as float32,
where a magnitude of 6.6e6 has a spacing of roughly half a metre. Feeding those
values in directly collapses the geometry, so the script subtracts one shared
origin from the point cloud and from every wireframe of the same building at
once, which keeps them aligned with each other.

```
python3 tools/prepare_models.py --txt 7114.txt --out-dir static/models \
    --name b7114 --wf wf=7114_origin.obj --wf bw=7114_200.obj
```

`tools/crop_aligned.py` crops a set of renders that came from one camera. The
crop box is the union of every image's content rather than each image's own, so
a sparse sampling and a full point cloud stay registered after cropping.

## Notes for whoever picks this up

`web_process.md` in this repository is the working log. It records what each
section is, why it is built the way it is, which decisions were made, and what
is still open.

## Acknowledgements

Design direction follows the [Surflo](https://anttwo.github.io/surflo/) project
page. Content is licensed under
[CC BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/).
