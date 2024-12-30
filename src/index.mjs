import mapboxgl from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";
import "./styles.css";

import mountainsFeatureCollection from "./mountains.json";

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <circle class="background" cx="16" cy="16" r="12" />
  <circle fill="none" stroke="white" cx="16" cy="16" r="12" stroke-width="2" />
  <polygon fill="white" points="9.4142 19.4142 16 12.8286 22.5858 19.4142 24 18 16 10 8 18 9.4142 19.4142"/>
</svg>`;

const info = document.querySelector("#info");
const svgOverlay = document.querySelector("#svg");

const GAP = 50;

mapboxgl.accessToken =
  "pk.eyJ1IjoicGhpbGlwcGZyb21tZSIsImEiOiJja2R1bTc1NW8waWN6MnVzZ2VnNGV4bDVpIn0.UusAsnFu5RwCC6q7cIl8hQ";

const map = new mapboxgl.Map({
  container: "map",
  zoom: 12,
  center: [0, 0],
  pitch: 0,
  hash: true,
  style: "mapbox://styles/philippfromme/cm1v465nr00s601pl4i6n2yln",
  maxZoom: 20,
  maxPitch: 0,
});

map.addControl(new mapboxgl.FullscreenControl());

map.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    // When active the map will receive updates to the device's location as it changes.
    trackUserLocation: true,
    // Draw an arrow next to the location dot to indicate which direction the device is heading.
    showUserHeading: true,
  })
);

map.on("load", async () => {
  let clicked = false;

  window.addEventListener("click", () => {
    document.querySelectorAll(".marker-mountain").forEach((marker) => {
      marker.classList.remove("marker-mountain--selected");
    });

    document.querySelector("#info").classList.remove("open");

    clicked = false;
  });

  mountainsFeatureCollection.features.forEach((feature) => {
    const el = document.createElement("div");

    el.innerHTML = svg;

    el.classList.add("marker-mountain");

    if (feature.properties.climbed) {
      el.classList.add("marker-mountain--climbed");
    }

    const setInfo = () => {
      let text;

      if (feature.properties.height) {
        text = `${feature.properties.name} (${feature.properties.height}m)`;
      } else {
        text = `${feature.properties.name}`;
      }

      document.querySelector("#info").innerHTML = text;
    };

    const showInfo = () => {
      document.querySelector("#info").classList.add("open");

      let infoBounds = document.querySelector("#info").getBoundingClientRect();
      let markerBounds = el.getBoundingClientRect();

      const horizontalOrientation =
        markerBounds.x + markerBounds.width / 2 > window.innerWidth / 2
          ? "left"
          : "right";
      const verticalOrientation =
        markerBounds.y + markerBounds.height / 2 > window.innerHeight / 2
          ? "top"
          : "bottom";

      if (horizontalOrientation === "left") {
        info.style.left = markerBounds.x - infoBounds.width - GAP + "px";
      } else {
        info.style.left = markerBounds.x + markerBounds.width + GAP + "px";
      }

      if (verticalOrientation === "top") {
        info.style.top = markerBounds.y - infoBounds.height - GAP + "px";
      } else {
        info.style.top = markerBounds.y + markerBounds.height + GAP + "px";
      }

      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );

      line.id = "line";

      infoBounds = document.querySelector("#info").getBoundingClientRect();

      line.setAttribute("x1", infoBounds.x + infoBounds.width / 2);
      line.setAttribute("y1", infoBounds.y + infoBounds.height / 2);
      line.setAttribute("x2", markerBounds.x + markerBounds.width / 2);
      line.setAttribute("y2", markerBounds.y + markerBounds.height / 2);
      line.setAttribute("stroke", "blue");
      line.setAttribute("stroke-width", "2");

      svgOverlay.appendChild(line);
    };

    const hideInfo = () => {
      document.querySelector("#info").classList.remove("open");

      svgOverlay.innerHTML = "";
    };

    el.addEventListener("click", (e) => {
      e.stopPropagation();

      clicked = true;

      map.flyTo({
        center: feature.geometry.coordinates,
      });

      if (el.classList.contains("marker-mountain--selected")) {
        // el.classList.remove("marker-mountain--selected");
        // document.querySelector("#info").classList.remove("open");
      } else {
        document.querySelectorAll(".marker-mountain").forEach((marker) => {
          marker.classList.remove("marker-mountain--selected");
        });

        el.classList.add("marker-mountain--selected");

        setInfo();

        showInfo();
      }
    });

    el.addEventListener("mouseenter", (e) => {
      if (clicked) return;

      document.querySelectorAll(".marker-mountain").forEach((marker) => {
        marker.classList.remove("marker-mountain--selected");
      });

      el.classList.add("marker-mountain--selected");

      setInfo();

      showInfo();
    });

    el.addEventListener("mouseleave", (e) => {
      if (clicked) return;

      el.classList.remove("marker-mountain--selected");

      hideInfo();
    });

    new mapboxgl.Marker(el).setLngLat(feature.geometry.coordinates).addTo(map);
  });

  map.on("click", () => {
    document.querySelectorAll(".marker-mountain").forEach((marker) => {
      marker.classList.remove("marker-mountain--selected");
    });
  });

  map.on("zoomstart", () => {
    console.log("zoomstart");
  });

  map.on("zoomend", () => {
    console.log("zoomstart");
  });

  map.on("movestart", () => {
    console.log("movestart");
  });

  map.on("moveend", () => {
    console.log("moveend");
  });

  map.setFog({
    range: [0.5, 10],
    color: "white",
    "horizon-blend": 0.1,
    "high-color": "white",
    "space-color": "white",
    "star-intensity": 0,
  });
});
