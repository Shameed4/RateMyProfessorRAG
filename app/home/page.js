import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export default function HomePage() {
  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#F8F4FF',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: 2,
        margin: 0,
        boxSizing: 'border-box',
      }}
    >
      <Typography variant="h2" sx={{ mb: 4, color: '#333' }}>
        Welcome to Rate My Professor AI
      </Typography>
      <Box width="80vw">
      <Typography variant="body1" sx={{ mb: 4, color: '#666' }}>
        Our AI-powered chatbot is here to help you with your questions and provide insights on professors nationwide. 
        Start a conversation and see how our chatbot can assist you today!
      </Typography>
      </Box>
      <Button 
        variant="contained" 
        sx={{ backgroundColor: '#7C49F6', color: '#fff', 
            '&:hover': {
            backgroundColor: '#5a2d91', // Darker shade of the button color
            color: '#e0e0e0', // Lighter color for the text on hover
          },
        }}
        //onClick={() => window.alert('Chatbot feature coming soon!')}
      >
        Start Chatting
      </Button>
    </Box>
  );
}