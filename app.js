import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import {AmbientLight, PointLight, LightingEffect} from '@deck.gl/core';
import {HexagonLayer} from '@deck.gl/aggregation-layers';
import {IconLayer} from '@deck.gl/layers';
import DeckGL from '@deck.gl/react';

//GPSにて現在地を取得
var watch_id = navigator.geolocation.watchPosition(test2, function(e) { alert(e.message); }, {"enableHighAccuracy": true, "timeout": 20000, "maximumAge": 2000});
var iconDatas = [];

const ICON_MAPPING = {
  marker: {x: 0, y: 0, width: 32, height: 32, mask: true}
};

//取得したGPSデータを緯度経度のみ取り出して出力
function test2(position) {
    var location = position.coords.longitude + ',' + position.coords.latitude;

    // IconLayer用の形式変換
    iconDatas =[
      {
        position: [position.coords.longitude, position.coords.latitude]
      }
    ];

    return location;

}

// Set your mapbox token here
const MAPBOX_TOKEN = "pk.eyJ1IjoieXVtbmlrb25pa28iLCJhIjoiY2s2MzdhczF6MDdlODNtbjB3NzkydzJ6NSJ9.xdMakcrqSAWMmZMYnQiEYw"; // eslint-disable-line

// Source data CSV
const DATA_URL =
  'Sample_Center.csv'; // eslint-disable-line

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});

const pointLight1 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-0.144528, 49.739968, 80000]
});

const pointLight2 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-3.807751, 54.104682, 8000]
});

const lightingEffect = new LightingEffect({ambientLight, pointLight1, pointLight2});

const material = {
  ambient: 0.64,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [51, 51, 51]
};

//マップ初期表示設定
const INITIAL_VIEW_STATE = {
  longitude: 136.897874,
  latitude: 35.1620737,
  zoom: 10.0,
  minZoom: 5,
  maxZoom: 15,
  pitch: 40.5,
  bearing: -27.396674584323023
};

//3Dグラフに表示される際の色の設定
const colorRange = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78]
];

const elevationScale = {min: 1, max: 200};

/* eslint-disable react/no-deprecated */
export default class App extends Component {
  static get defaultColorRange() {
    return colorRange;
  }

  constructor(props) {
    super(props);
    this.state = {
      elevationScale: elevationScale.min
    };
  }

  _renderLayers() {
    const {data, radius = 400, upperPercentile = 100, coverage = 1} = this.props;

    
    return [
      //浸水データを出力するためのレイヤー
      new HexagonLayer({
        id: 'heatmap',
        colorRange,
        coverage,
        data,
        elevationRange: [0, 300],
        elevationScale: data && data.length ? 50 : 0,
        extruded: true,
        getPosition: d => d,
        onHover: this.props.onHover,
        pickable: Boolean(this.props.onHover),
        radius,
        upperPercentile,
        material,

        transitions: {
          elevationScale: 3000
        }
      }),
      //現在地を出力するためのレイヤー
      new IconLayer({
        id: 'icon-layer',
        data: iconDatas,
        pickable: true,
        iconAtlas: 'images/map_pin.png',
        iconMapping: ICON_MAPPING,
        getIcon: (iconData) => {

          return "marker";
        },
        sizeScale: 15,
        getPosition: (iconData) => {
          return iconData.position;
        },
        getSize: d => 5,
        getColor: d => [Math.sqrt(d.exits), 140, 0]
      })
    ];
  }

  render() {
    const {mapStyle = 'mapbox://styles/mapbox/dark-v9'} = this.props;

    return (
      <DeckGL
        layers={this._renderLayers()}
        effects={[lightingEffect]}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
      >
        <StaticMap
          reuseMaps
          mapStyle={mapStyle}
          preventStyleDiffing={true}
          mapboxApiAccessToken={MAPBOX_TOKEN}
        />
      </DeckGL>
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);

  require('d3-request').csv(DATA_URL, (error, response) => {
    if (!error) {
      const data = response.map(d => [Number(d.lng), Number(d.lat)]);
      render(<App data={data} />, container);
    }
  });
}

/*
const loadData = () =>{
  data = test2();
  GPSLy(data);
}
const GPSLy = (data) => {
  const IconLayer = new dack.IconLayer({
    id: 'icon-layer',
    data,
    pickable: true,
    iconAtlas: 'map-pin.png',
    iconMapping: ICON_MAPPING,
    getIcon: d => 'marker',
    sizeScale: 15,
    getPosition: data,
    getSize: d => 5
  });

  DeckGL.setProps({
    layers: [IconLayer]
  });

  renderLayer(data);
}

*/