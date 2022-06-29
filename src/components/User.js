import React, { useState, useEffect } from "react";
import { Icon, Modal, Card } from "web3uikit";
import { useMoralis } from "react-moralis";

function User({ account }) {
    const [isVisible, setIsVisible] = useState(false);

    const { Moralis, isInitialized } = useMoralis();
    const [userRentals, setUserRentals] = useState([]);

    useEffect(() => {
        async function fetchRentals() {
            const Rentals = Moralis.Object.extend("NewBookings");
            const query = new Moralis.Query(Rentals);
            query.equalTo("booker", account);
            const result = await query.find();

            setUserRentals(result);
        }

        if (isInitialized && isVisible) {
            fetchRentals();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVisible]);

    return (
        <>
            <div onClick={() => setIsVisible(true)}>
                <Icon fill="#000" size={24} svg="user" />
            </div>

            <Modal
                onCloseButtonPressed={() => setIsVisible(false)}
                hasFooter={false}
                title="Your Stays"
                isVisible={isVisible}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "start",
                        flexWrap: "wrap",
                        gap: "10px",
                    }}
                >
                    {userRentals.length > 0 &&
                        userRentals.map((rental, index) => {
                            return (
                                <div style={{ width: "200px" }} key={index}>
                                    <Card
                                        isDisabled
                                        title={rental.attributes.city}
                                        description={`${
                                            rental.attributes.datesBooked[0]
                                        } for ${
                                            rental.attributes.datesBooked.length
                                        } day${
                                            rental.attributes.datesBooked
                                                .length !== 1
                                                ? "s"
                                                : ""
                                        }`}
                                    >
                                        <div>
                                            <img
                                                width="180px"
                                                src={rental.attributes.imgUrl}
                                                alt="Your Stay"
                                            />
                                        </div>
                                    </Card>
                                </div>
                            );
                        })}
                </div>
            </Modal>
        </>
    );
}

export default User;
