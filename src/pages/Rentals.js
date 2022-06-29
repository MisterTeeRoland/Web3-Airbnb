import React, { useState, useEffect } from "react";
import "./Rentals.css";
import { Link, useLocation } from "react-router-dom";
import logo from "../images/airbnbRed.png";
import { ConnectButton, Icon, Button, useNotification } from "web3uikit";
import RentalsMap from "../components/RentalsMap";
import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";
import User from "../components/User";

const Rentals = () => {
    const { state: searchFilters } = useLocation();
    const [highlight, setHighlight] = useState();
    const [rentalsList, setRentalsList] = useState([]);
    const [coords, setCoords] = useState([]);
    const { Moralis, account, isInitialized } = useMoralis();
    const contractProcessor = useWeb3ExecuteFunction();
    const dispatch = useNotification();

    const handleSuccess = () => {
        dispatch({
            type: "success",
            message: `Nice! You are goin to ${searchFilters.destination}`,
            title: "Booking Successful",
            position: "topL",
        });
    };

    const handleError = (error) => {
        dispatch({
            type: "error",
            message: `${error}`,
            title: "Booking Failed",
            position: "topL",
        });
    };

    const handleNoAccount = () => {
        dispatch({
            type: "error",
            message: "You need to connect your wallet to book a rental",
            title: "Not Connected",
            position: "topL",
        });
    };

    useEffect(() => {
        async function fetchRentalsList() {
            const Rentals = Moralis.Object.extend("Rentals");
            const query = new Moralis.Query(Rentals);
            query.equalTo("city", searchFilters.destination);
            query.greaterThanOrEqualTo(
                "maxGuests_decimal",
                searchFilters.guests
            );
            const results = await query.find();

            let coords = [];
            results.forEach((rental) => {
                coords.push({
                    lat: rental.attributes.lat,
                    lng: rental.attributes.long,
                });
            });

            setRentalsList(results);
            setCoords(coords);
        }
        if (isInitialized) {
            fetchRentalsList();
        }
        return () => {
            setRentalsList([]);
            setCoords([]);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchFilters]);

    const bookRental = async (start, end, id, dayPrice) => {
        for (
            var arr = [], dt = new Date(start);
            dt <= end;
            dt.setDate(dt.getDate() + 1)
        ) {
            arr.push(new Date(dt).toISOString().slice(0, 10));
        }

        let options = {
            contractAddress: "0xD62781eA7efF90ff13c5db8E7cfbc7a3cbF2A4F8",
            functionName: "addDatesBooked",
            abi: [
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "id",
                            type: "uint256",
                        },
                        {
                            internalType: "string[]",
                            name: "newBookings",
                            type: "string[]",
                        },
                    ],
                    name: "addDatesBooked",
                    outputs: [],
                    stateMutability: "payable",
                    type: "function",
                },
            ],
            params: {
                id,
                newBookings: arr,
            },
            msgValue: Moralis.Units.ETH(dayPrice * arr.length),
        };

        await contractProcessor.fetch({
            params: options,
            onSuccess: async (result) => {
                handleSuccess();
            },
            onError: async (error) => {
                handleError(error?.data?.message ?? error?.message ?? error);
            },
        });
    };

    return (
        <>
            <div className="topBanner">
                <div>
                    <Link to="/">
                        <img className="logo" src={logo} alt="logo" />
                    </Link>
                </div>
                <div className="searchReminder">
                    <div className="filter">{searchFilters.destination}</div>
                    <div className="vl"></div>
                    <div className="filter">
                        {`
                        ${searchFilters.checkIn.toLocaleString("default", {
                            month: "short",
                        })}
                        ${searchFilters.checkIn.toLocaleString("default", {
                            day: "2-digit",
                        })}
                        -
                        ${searchFilters.checkOut.toLocaleString("default", {
                            month: "short",
                        })}
                        ${searchFilters.checkOut.toLocaleString("default", {
                            day: "2-digit",
                        })}
                        `}
                    </div>
                    <div className="vl"></div>
                    <div className="filter">{searchFilters.guests} guests</div>
                    <div className="searchFiltersIcon">
                        <Icon fill="#fff" size={20} svg={"search"} />
                    </div>
                </div>
                <div className="lrContainers">
                    {account && <User account={account} />}
                    <ConnectButton />
                </div>
            </div>

            <hr className="line" />
            <div className="rentalsContent">
                <div className="rentalsContentL">
                    Stays Available for Your Destination
                    {rentalsList &&
                        rentalsList.map((rental, index) => {
                            return (
                                <div key={index}>
                                    <hr className="line2" />
                                    <div
                                        className={
                                            highlight === index
                                                ? "rentalDivH"
                                                : "rentalDiv"
                                        }
                                    >
                                        <img
                                            className="rentalImg"
                                            src={rental.attributes.imgUrl}
                                            alt="rentalImg"
                                        />
                                        <div className="rentalInfo">
                                            <div className="rentalTitle">
                                                {rental.attributes.name}
                                            </div>
                                            <div className="rentalDesc">
                                                {
                                                    rental.attributes
                                                        .unoDescription
                                                }
                                            </div>
                                            <div className="rentalDesc">
                                                {
                                                    rental.attributes
                                                        .dosDescription
                                                }
                                            </div>
                                            <div className="bottomButton">
                                                <Button
                                                    text="Stay Here"
                                                    onClick={() => {
                                                        if (account) {
                                                            bookRental(
                                                                searchFilters.checkIn,
                                                                searchFilters.checkOut,
                                                                rental
                                                                    .attributes
                                                                    .uid_decimal
                                                                    .value
                                                                    .$numberDecimal,
                                                                Number(
                                                                    rental
                                                                        .attributes
                                                                        .pricePerDay_decimal
                                                                        .value
                                                                        .$numberDecimal
                                                                )
                                                            );
                                                        } else {
                                                            handleNoAccount();
                                                        }
                                                    }}
                                                />
                                                <div className="price">
                                                    <Icon
                                                        fill="#808080"
                                                        size={10}
                                                        svg={"matic"}
                                                    />{" "}
                                                    {
                                                        rental.attributes
                                                            .pricePerDay
                                                    }{" "}
                                                    / Day
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
                <div className="rentalsContentR">
                    <RentalsMap
                        locations={coords}
                        setHighlight={setHighlight}
                    />
                </div>
            </div>
        </>
    );
};

export default Rentals;
