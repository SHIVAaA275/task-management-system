require("dotenv").config();

const dns = require("dns");
dns.setServers(["1.1.1.1"]);

const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri);

async function testConnection() {
  try {
    await client.connect();

    console.log("MongoDB connected successfully!");

    await client.db("taskManagement").command({ ping: 1 });

    console.log("MongoDB ping successful!");
  } catch (error) {
    console.log("MongoDB connection failed:");
    console.log(error.message);
  } finally {
    await client.close();
  }
}

testConnection();