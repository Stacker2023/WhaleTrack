import express, { Express, Request, Response } from "express";

// Create a new express application
const app: Express = express();

// The port the express app will listen on
const PORT: number = 3000;

// Use the body-parser middleware to parse incoming request bodies.
// We set a limit of 5mb to handle large payloads that may come with the POST requests.
// This is necessary to prevent potential issues with payload size exceeding the default limit.
app.use(
  express.json({ limit: "5mb" }),
  express.urlencoded({ limit: "5mb", extended: true })
);

// function hexToUtf8(hex: string) {
//   if (hex.startsWith("0x")) {
//     hex = hex.slice(2);
//   }
//   let str = "";
//   for (let i = 0; i < hex.length; i += 2) {
//     str += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16));
//   }
//   return decodeURIComponent(encodeURIComponent(str));
// }

// function renderHTML(events: any[]): string {
//   let html = "<ul>";
//   events.forEach((event) => {
//     html += `<li>${JSON.stringify(event)}</li>`;
//   });
//   html += "</ul>";
//   return html;
// }

let minMicroSTX = 5000000000  // 5000 STX
let msgList:any = []

// All routes for the Express app
app.post("/api/events", async (req, res) => {
  const events = req.body;
  // Loop through each item in the apply array
  events.apply.forEach((item: any) => {
    // Loop through each transaction in the item
    item.transactions.forEach((transaction: any) => {
      if (!transaction.metadata.success) {
        return
      }
      if (transaction.metadata.kind.type != 'NativeTokenTransfer') {
        return
      }
      let stxAmount = 0
      let debitAddress = null
      if (transaction.operations) {
        transaction.operations.forEach((operation: any) => {
          if (operation.type == 'DEBIT' && operation.status == 'SUCCESS') {
            stxAmount = operation.amount.value
            debitAddress = operation.account.address
            return
          }
        });
      }
      if (stxAmount >= minMicroSTX) {
        msgList.push({
          hash: transaction.transaction_identifier.hash,
          stxAmount: stxAmount,
          debitAddress: debitAddress,
        })
      }
    });
  });

  res.setHeader('Access-Control-Allow-Origin', '*')
  // Send a response back to Chainhook to acknowledge receipt of the event
  res.status(200).send({ message: "Proposal added!" });
});

app.get("/api/fetchWhaleActions", async (req, res) => {
  let minTransferSTXParam = req.query.minTransferSTX as string
  let minTransferSTX = parseInt(minTransferSTXParam)
  res.setHeader('Access-Control-Allow-Origin', '*')
  // Send a response back to Chainhook to acknowledge receipt of the event
  let resultList = []
  for (const v of msgList) {
    if (v.stxAmount >= minTransferSTX) {
      resultList.push(v)
    }
  }
  res.status(200).send({ resultList: resultList });
})

// Start server on port 3000
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
