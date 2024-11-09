import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// import { executeTx } from "./controllers/executeTxn.js";
// app.post("/api/executeTx", executeTx);

app.get('/health', (_, res) => {
  res.json({ status: 'healthy' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;