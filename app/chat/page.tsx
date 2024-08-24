'use client'
import { Box, Button, Stack, TextField, Typography, Divider } from '@mui/material'
import { useState, useRef, useEffect } from 'react'
import "/app/globals.css"
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from "next/navigation"
import { Router } from 'next/router';
import {ScrapeDiv} from "../components/scrape"

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm the Rate My Professor support assistant. How can I help you today?`,
    },
  ])
  const [message, setMessage] = useState('')
  const router = useRouter()
  const stackRef = useRef(null);

  useEffect(() => {
    if (stackRef.current) {
      stackRef.current.scrollTop = stackRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])



    const response = fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let result = ''

      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result
        }
        const text = decoder.decode(value || new Uint8Array(), { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })
        return reader.read().then(processText)
      })
    })

  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{
        background: 'linear-gradient(135deg, #DCB7FF, #FDCEAB)',  //#C78BFF, #feb47b
        padding: 0,
        margin: 0,
        boxSizing: 'border-box'
      }}
      padding={3}
    >
      
      <Stack
        direction={'column'}
        width="500px"
        height="90vh"
        border="1px solid black"
        borderRadius={4}
        p={2}
        spacing={2}
        sx={{ backgroundColor: "#E1C9FE" }}

      >
        <Box width="100%" height="50px" sx={{ backgroundColor: "#831FFE" }}
          borderRadius={4} display="flex" justifyContent="center" alignItems="center" padding={1}
        >
          <Typography variant="h5" color="white">Rate My Professor Chatbot</Typography>

        </Box>
        <ScrapeDiv/>
        <Divider sx={{ width: '100%', borderBottomWidth: 2 }} />
        <Stack
          direction={'column'}
          spacing={2}

          flexGrow={1}
          overflow="auto" //this ******make it autoscroll
          maxHeight="100%"
          ref={stackRef}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box

                bgcolor={
                  message.role === 'assistant'
                    ? '#EDDFFE'
                    : '#AB67FF'
                }
                color="black"
                borderRadius={16}
                mx={2}

                sx={{ whiteSpace: 'pre-wrap' }}
                padding={3}

              >
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onKeyDown={(e) => {
              if (e.key == 'Enter') {
                e.preventDefault()
                sendMessage()
              }
            }}
            onChange={(e) => setMessage(e.target.value)}
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
            }}
          />
          <Button sx={{
            backgroundColor: "#831FFE",
            '&:hover': {
              backgroundColor: "#6302DB", // Background color on hover
            },
          }} variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Stack>
      </Stack>

      <Box
        onClick={() => {
          router.push("/")
        }}
        sx={{
          position: 'fixed',
          top: "1vw",
          left: "1vw",
          backgroundColor: '#831FFE',
          color: 'white',
          padding: 2,
          borderRadius: 2,
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&:hover': {
            backgroundColor: "#6302DB", // Background color on hover
          },
        }}>
        <ArrowBackIcon />
      </Box>

    </Box>
  )
}