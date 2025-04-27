module.exports = async function (req, res) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const ASSISTANT_ID = "asst_lpiEAOHH37dnYccwOal7qkt6";

  const { action, threadId, userMessage, runId } = req.body;

  if (!action) {
    res.status(400).json({ error: "No action provided" });
    return;
  }

  let url = "";
  let method = "POST";
  let body = {};

  if (action === "createThread") {
    url = "https://api.openai.com/v1/threads";
    body = {};
  } else if (action === "sendMessage") {
    url = `https://api.openai.com/v1/threads/${threadId}/messages`;
    body = {
      role: "user",
      content: userMessage
    };
  } else if (action === "runThread") {
    url = `https://api.openai.com/v1/threads/${threadId}/runs`;
    body = {
      assistant_id: ASSISTANT_ID
    };
  } else if (action === "checkRun") {
    url = `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`;
    method = "GET";
  } else if (action === "getMessages") {
    url = `https://api.openai.com/v1/threads/${threadId}/messages`;
    method = "GET";
  } else {
    res.status(400).json({ error: "Invalid action" });
    return;
  }

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2"
      },
      ...(method === "POST" ? { body: JSON.stringify(body) } : {})
    });

    const data = await response.json();

    if (action === "createThread") {
      res.status(200).json({ threadId: data.id });
    } else if (action === "runThread") {
      res.status(200).json({ runId: data.id, status: data.status });
    } else if (action === "checkRun") {
      res.status(200).json({ status: data.status });
    } else if (action === "getMessages") {
      const assistantReply = data.data.find(m => m.role === "assistant");
      res.status(200).json({ assistantReply: assistantReply ? assistantReply.content[0].text.value : "" });
    } else {
      res.status(200).json(data);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
}
