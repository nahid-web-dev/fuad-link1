"use client";

import React, { useState } from "react";
import { ShieldCheck, ChevronDown, Delete } from "lucide-react";
import axios from "axios";
import { useParams } from "next/navigation";

const Home = () => {
  const [amount, setAmount] = useState("0");

  const params = { linkname: "maria" };

  // Handle keypad presses
  const handleKeyPress = (value) => {
    setAmount((prev) => {
      // Prevent multiple decimals
      if (value === "." && prev.includes(".")) return prev;

      // Handle backspace
      if (value === "<") {
        if (prev.length <= 1) return "0";
        return prev.slice(0, -1);
      }

      // If current value is just "0", replace it (unless adding a decimal)
      if (prev === "0" && value !== ".") {
        return value;
      }

      // Limit max decimal places to 2
      if (prev.includes(".")) {
        const [, decimal] = prev.split(".");
        if (decimal && decimal.length >= 2) return prev;
      }

      return prev + value;
    });
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "<"];

  return <div></div>;
};

export default Home;
