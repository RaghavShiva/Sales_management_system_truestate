import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import Sale from "../models/Sale.js";

const __root = path.resolve();
const FILE_PATH = process.env.CSV_PATH || path.join(__root, "dataset.csv");

// safer date parsing
function safeDate(v) {
  if (!v) return null;
  const s = String(v).trim();
  if (!s) return null;

  const d1 = new Date(s);
  if (!isNaN(d1.valueOf())) return d1;

  let m = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (m) {
    const [, dd, mm, yy] = m;
    const d = new Date(Number(yy), Number(mm) - 1, Number(dd));
    if (!isNaN(d.valueOf())) return d;
  }

  m = s.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
  if (m) {
    const [, yy, mm, dd] = m;
    const d = new Date(Number(yy), Number(mm) - 1, Number(dd));
    if (!isNaN(d.valueOf())) return d;
  }

  return null;
}

async function runSeed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("connected to db");

    await Sale.deleteMany({});
    console.log("old data cleared");

    const CHUNK = 10000;
    let buf = [];
    let seen = 0;
    let pushed = 0;
    let badDates = 0;

    await new Promise((resolve, reject) => {
      const read = fs.createReadStream(FILE_PATH).pipe(csv());

      read.on("data", (row) => {
        seen++;

        try {
          const d = safeDate(row["Date"]);
          if (!d) {
            badDates++;
            if (badDates <= 3) {
              console.warn("invalid date row:", seen, row["Date"]);
            }
          }

          const obj = {
            transactionId: row["Transaction ID"],
            date: d,

            customerId: row["Customer ID"],
            customerName: row["Customer Name"] || "",
            phoneNumber: row["Phone Number"] ? String(row["Phone Number"]) : "",
            gender: row["Gender"] || "",
            age: row["Age"] ? Number(row["Age"]) : null,
            customerRegion: row["Customer Region"] || "",
            customerType: row["Customer Type"] || "",

            productId: row["Product ID"],
            productName: row["Product Name"] || "",
            brand: row["Brand"] || "",
            productCategory: row["Product Category"] || "",
            tags: (row["Tags"] || "")
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean),

            quantity: row["Quantity"] ? Number(row["Quantity"]) : 0,
            pricePerUnit: row["Price per Unit"]
              ? Number(row["Price per Unit"])
              : 0,
            discountPercentage: row["Discount Percentage"]
              ? Number(row["Discount Percentage"])
              : 0,
            totalAmount: row["Total Amount"]
              ? Number(row["Total Amount"])
              : 0,
            finalAmount: row["Final Amount"]
              ? Number(row["Final Amount"])
              : 0,

            paymentMethod: row["Payment Method"] || "",
            orderStatus: row["Order Status"] || "",
            deliveryType: row["Delivery Type"] || "",

            storeId: row["Store ID"] || "",
            storeLocation: row["Store Location"] || "",

            salespersonId: row["Salesperson ID"] || "",
            employeeName: row["Employee Name"] || ""
          };

          buf.push(obj);

          if (buf.length >= CHUNK) {
            read.pause();

            Sale.insertMany(buf)
              .then((res) => {
                pushed += res.length;
                buf = [];
                console.log("inserted so far:", pushed);
                read.resume();
              })
              .catch((err) => {
                console.error("batch insert error", err);
                reject(err);
              });
          }
        } catch (e) {
          console.error("row error:", seen, e.message);
        }
      });

      read.on("end", async () => {
        try {
          if (buf.length) {
            const r = await Sale.insertMany(buf);
            pushed += r.length;
          }

          console.log("rows read:", seen);
          console.log("inserted:", pushed);
          if (badDates > 0) console.log("invalid date rows:", badDates);

          resolve();
        } catch (err) {
          reject(err);
        }
      });

      read.on("error", (err) => reject(err));
    });

    console.log("seeding done");
    process.exit(0);
  } catch (err) {
    console.error("seed failure:", err);
    process.exit(1);
  }
}

runSeed();
