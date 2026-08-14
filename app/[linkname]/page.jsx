"use client";

import React, { useState } from "react";
import { ShieldCheck, ChevronDown, Delete, LoaderCircle } from "lucide-react";
import axios from "axios";
import { useParams } from "next/navigation";

const Link1 = () => {
  const [amount, setAmount] = useState("0");

  const [loading, setLoading] = useState(false);

  const params = useParams();

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

  return (
    <div className="bg-[#00d632] text-white font-sans flex items-center justify-center">
      <div className="w-full max-w-sm min-h-dvh flex flex-col justify-center gap-3 items-center py-2">
        {/* Header Section */}
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Avatar Icon */}
          <div className="w-12 h-12 rounded-full bg-[#00b029] flex items-center justify-center font-bold text-lg shadow-inner">
            {params.linkname.charAt(0).toUpperCase()}
          </div>

          {/* Recipient Title */}
          <h1 className="text-2xl font-bold tracking-tight">
            Pay{" "}
            {params.linkname.charAt(0).toUpperCase() + params.linkname.slice(1)}
          </h1>

          {/* Secure Payment Pill */}
          <div className="flex items-center gap-1.5 bg-[#00b029]/80 text-xs font-semibold px-3 py-1.5 rounded-full border border-white/10">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure Payment</span>
          </div>
        </div>

        {/* Amount Display */}
        <div className="my-8 text-center flex flex-col items-center">
          <div className="text-6xl font-extrabold tracking-tight">
            ${amount}
          </div>

          {/* Currency Selector Pill */}
          {/* <button className="mt-4 flex items-center gap-1 bg-[#00b029] text-xs font-bold px-3 py-1.5 rounded-full border border-white/10 hover:bg-[#009e24] transition-colors">
            <span>USD</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button> */}
        </div>

        {/* Custom Numpad Grid */}
        <div className="w-full grid grid-cols-3 gap-y-6 gap-x-4 mb-8 text-center">
          {keys.map((key) => (
            <button
              key={key}
              onClick={() => handleKeyPress(key)}
              className="py-3 text-3xl font-semibold hover:bg-white/10 active:bg-white/20 rounded-2xl transition-colors flex items-center justify-center select-none cursor-pointer"
            >
              {key === "<" ? (
                <span className="text-2xl font-bold">&lt;</span>
              ) : (
                key
              )}
            </button>
          ))}
        </div>

        {/* Submit Pay Button */}
        <button
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            const response = await axios.post(`/api/invoices/generate`, {
              amount: Number(amount),
              linkname: params.linkname,
            });
            if (response.data?.success) {
              window.location.href = `https://cash.app/launch/lightning/${response.data.link}`;
            } else {
              setLoading(false);
              console.log(response.data);
            }
          }}
          className="w-full py-4 bg-[#00b62a] hover:bg-[#009e24] active:scale-[0.99] font-bold text-lg rounded-2xl transition-all shadow-md cursor-pointer border border-white/10"
        >
          {loading ? (
            <LoaderCircle className=" mx-auto animate-spin " />
          ) : (
            "Pay"
          )}
        </button>
      </div>
    </div>
  );
};

export default Link1;
