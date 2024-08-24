'use client'
import { Box, Button, Stack, TextField, Typography, Divider } from '@mui/material'
import { useState } from 'react'
import "/app/globals.css"
export default function Home() {
  // We'll add more code here in the following steps
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm the Rate My Professor support assistant. How can I help you today?`,
    },
  ])
  const [message, setMessage] = useState('')

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
          borderRadius={4} display="flex" justifyContent="center" alignItems="center"
        >
          <Typography variant="h5" color="white">Rate My Professor Chatbot</Typography>

        </Box>
        <Divider sx={{ width: '100%', borderBottomWidth: 2 }} />
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
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
                    : '#831FFE'
                }
                color="black"
                borderRadius={16}
                p={3}
                sx={{ whiteSpace: 'pre-wrap' }}
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
                color: 'grey.700', // Label color when not focused
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: 'grey.600', // Label color when focused
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
    </Box>
  )
}