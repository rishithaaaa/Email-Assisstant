import {useState} from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import Container from "@mui/material/Container";
import axios from "axios";

function App() {
  const [emailContent, setEmailContent] = useState("");
  const [tone, setTone] = useState("");
  const [generatedReply, setGeneratedReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      //use axios
      const response = await axios.post(
        "http://localhost:8080/api/email/generate",
        {
          emailContent,
          tone,
        }
      );
      setGeneratedReply(
        typeof response.data === "string"
          ? response.data
          : JSON.stringify(response.data)
      );
    } catch (error) {
      setError("An error occurred while generating the reply." + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Container maxWidth="md" sx={{py: 4}}>
      <Typography variant="h3" component="h1" gutterBottom>
        Email Reply Generator
      </Typography>
      <Box sx={{mx: 3}} />
      <TextField
        id="email-contents"
        label="Original Email Content"
        multiline
        rows={4}
        value={emailContent}
        onChange={(e) => setEmailContent(e.target.value)}
        fullWidth
        sx={{mb: 2}}
      />
      <FormControl fullWidth sx={{mb: 2}}>
        <InputLabel id="tone-label">Tone (Optional)</InputLabel>
        <Select
          labelId="tone-label"
          id="tone"
          value={tone || ""}
          label="Tone"
          onChange={(e) => setTone(e.target.value)}
        >
          <MenuItem value="formal">Formal</MenuItem>
          <MenuItem value="casual">Casual</MenuItem>
          <MenuItem value="informal">Informal</MenuItem>
        </Select>
      </FormControl>
      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={!emailContent || loading}
      >
        {loading ? <CircularProgress size={24} /> : "Generate Reply"}
      </Button>
      {error && (
        <Typography color="error" sx={{mb: 2}}>
          {error}
        </Typography>
      )}
      {generatedReply && (
        <Box sx={{mt: 3}}>
          <Typography variant="h6" gutterBottom>
            Generated Reply:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            inputMode="true"
            value={generatedReply || ""}
            sx={{mb: 2}}
          />
          <Button
            variant="outlined"
            sx={{mt: 2}}
            onClick={() => navigator.clipboard.writeText(generatedReply)}
          >
            Copy to ClipBoard
          </Button>
        </Box>
      )}
    </Container>
  );
}

export default App;
