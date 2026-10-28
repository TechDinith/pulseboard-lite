import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand, CreateQueueCommand } from "@aws-sdk/client-sqs";
import { stringify } from "csv-stringify";
import pkg from "pg";
const { Pool } = pkg;

const sqs = new SQSClient({
  region: process.env.AWS_REGION || "us-east-1",
  endpoint: process.env.SQS_ENDPOINT || "http://localhost:4566",
  credentials: { accessKeyId: "test", secretAccessKey: "test" },
});

const queueUrl = process.env.QUEUE_URL || "http://localhost:4566/000000000000/pulseboard-exports";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://pulseboard:pulseboard@localhost:5432/pulseboard",
});

async function ensureQueue() {
  try {
    await sqs.send(new CreateQueueCommand({ QueueName: "pulseboard-exports" }));
  } catch {}
}

async function processJob(job) {
  const { exportId, boardId, tenantId, requestedBy } = job;
  const client = await pool.connect();
  try {
    const res = await client.query(
      `select c.title, c.description, c.priority, c.labels, c.position, col.name as column_name
       from cards c
       join columns col on col.id = c.column_id
       where c.tenant_id = $1 and col.board_id = $2
       order by col.position, c.position`,
      [tenantId, boardId]
    );
    const records = res.rows;
    const csv = stringify(records, { header: true });
    await client.query(
      `update exports set status = $1, content = $2, updated_at = now() where id = $3`,
      ["COMPLETED", csv, exportId]
    );
    console.log(JSON.stringify({ status: "completed", exportId, boardId, tenantId, requestedBy, count: records.length }));
    console.log(csv);
  } catch (err) {
    await client.query(
      `update exports set status = $1, updated_at = now() where id = $2`,
      ["FAILED", exportId]
    );
    throw err;
  } finally {
    client.release();
  }
}

async function poll() {
  while (true) {
    try {
      const out = await sqs.send(new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 10,
      }));
      const messages = out.Messages || [];
      for (const msg of messages) {
        try {
          const job = JSON.parse(msg.Body);
          await processJob(job);
          await sqs.send(new DeleteMessageCommand({ QueueUrl: queueUrl, ReceiptHandle: msg.ReceiptHandle }));
        } catch (err) {
          console.error("job failed", err.message);
        }
      }
    } catch (err) {
      console.error("poll error", err.message);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

ensureQueue().then(() => poll());
