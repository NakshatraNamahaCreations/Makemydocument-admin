import { useState } from "react";
import axios from "axios";

export default function PaytmPayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initiatePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        CUST_ID: "12345",
        TXN_AMOUNT: "1.00",
        ORDER_ID: `ORD_${Date.now()}`,
        SERVICE: "BikeTransport",
    
            name: "check2",
            date: "2025-02-11", 
            time: "10:33:45",
            source: "website",
            service: "Car agreement",
            address: "Bengaluru",
            email: "part2@example.com",
            mobilenumber: "9876543210",
       
          
      };

      console.log("Sending Payload:", payload);

      const response = await axios.post("https://api.makemydocuments.in/api/PG/paytm/initiate", payload,{
        headers:{
            "Content-Type":"application/json",
        }
      });

      console.log("Paytm Response:", response.data);

      if (response.data.paramList && response.data.CHECKSUMHASH) {
        const paramList = response.data.paramList;
        const paytmTxnUrl = "https://securegw.paytm.in/order/process"; // Live Transaction URL (Use sandbox for testing)

        // ✅ Create a form dynamically and submit it to Paytm
        const form = document.createElement("form");
        form.method = "POST";
        form.action = paytmTxnUrl;

        // Append all parameters as hidden inputs
        Object.keys(paramList).forEach((key) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = paramList[key];
          form.appendChild(input);
        });

        // Append form to the body and submit
        document.body.appendChild(form);
        form.submit();
      } else {
        setError("Payment initiation failed.");
      }
    } catch (err) {
      console.error("Payment API Error:", err.response ? err.response.data : err.message);
      setError("Error initiating payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginLeft: "20rem" }}>
      <h1>Paytm Payment</h1>
      <button onClick={initiatePayment} disabled={loading}>
        {loading ? "Processing..." : "Pay with Paytm"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
