import React, { useState, useEffect } from "react";
import { Map, Marker, GoogleApiWrapper } from "google-maps-react";
const dotenv = require("dotenv");

dotenv.config();

function RentalsMap({ locations, google, setHighlight }) {
    const [center, setCenter] = useState();

    console.log("process.env", process.env);
    // console.log("api key", process.env.API_KEY);

    useEffect(() => {
        var arr = Object.keys(locations);
        var getLat = (key) => locations[key].lat;
        var avgLat =
            arr.reduce((acc, curr) => acc + Number(getLat(curr)), 0) /
            arr.length;

        var getLng = (key) => locations[key].lng;
        var avgLng =
            arr.reduce((acc, curr) => acc + Number(getLng(curr)), 0) /
            arr.length;

        setCenter({
            lat: avgLat,
            lng: avgLng,
        });

        return () => {
            setCenter(locations[0]);
        };
    }, [locations]);

    return (
        <>
            {center && (
                <Map
                    google={google}
                    containerStyle={{
                        width: "50vw",
                        height: "calc(100vh - 135px",
                    }}
                    center={center}
                    initialCenter={locations[0]}
                    zoom={13}
                    disableDefaultUI={true}
                >
                    {locations.map((location, index) => {
                        return (
                            <Marker
                                key={index}
                                position={location}
                                onClick={() => setHighlight(index)}
                            />
                        );
                    })}
                </Map>
            )}
        </>
    );
}

export default GoogleApiWrapper({
    apiKey: process.env.REACT_APP_API_KEY,
})(RentalsMap);
