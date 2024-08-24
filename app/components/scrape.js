import { Box, Button, Stack, TextField, Typography, Divider } from '@mui/material'
import { useState, useRef, useEffect } from 'react'
import "/app/globals.css"
import React from 'react';

const ScrapeDiv = () => {
    const [text, setText] = useState("")

    const handleInput = (event) => {
        const value = event.target.value
        let splittedValue = value.split("/")

        const valid = splittedValue.includes("www.ratemyprofessors.com") && splittedValue.includes("professor");
        if (valid === true) {
            setText(value)
        } else {
            setText("")
        }
        console.log(text)
    }
    const handleID = () => {
        const splittedValue = text.split("/")
        const regex = /^\d{4,9}$/
        const givenID = splittedValue[splittedValue.indexOf("www.ratemyprofessors.com") + 2]
        const valid = regex.test(givenID)
        if (valid === true) {
            console.log(givenID)
            fetchData(givenID)
        } else {
            alert("Professor ID is invalid. Please try again")
        }
    }

    const fetchData = async (id) => {
        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: `https://www.ratemyprofessors.com/professor/${id}` }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log(data); // Handle the data from the response
        } catch (error) {
            console.error('Fetch error:', error); // Handle errors
        }
    };

    return (
        <Box >
            <TextField
                value={text}
                onChange={handleInput}
                label="Enter RateMyProfessor Link ID" fullWidth multiline rows={1} variant="outlined"
                sx={{

                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: 'grey.500', // Default border color
                        },
                        '&:hover fieldset': {
                            borderColor: 'grey.700', // Border color on hover
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#831FFE', // Border color when focused
                        },
                    },
                    '& .MuiInputLabel-root': {
                        color: 'grey.900', // Label color when not focused
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                        color: 'grey.700', // Label color when focused
                    },
                }} />
            <Button sx={{
                mt: 0.5,
                color: "white",
                backgroundColor: '#4CAF50',
                '&:hover': {
                    backgroundColor: '#45A049', // Slightly darker green for hover effect
                },
                '&:active': {
                    backgroundColor: '#388E3C', // Even darker green for active state
                },
            }} fullWidth onClick={handleID} variant="outlined">Upload</Button>
        </Box>
    )
}

export { ScrapeDiv }