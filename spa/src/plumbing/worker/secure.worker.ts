const ctx: Worker = self as any;

// Post data to parent thread
ctx.postMessage({ x: "whatevar" });

// Respond to message from parent thread
ctx.addEventListener("message", (event) => {
    console.log(`*** WORKER: main data received: ${JSON.stringify(event.data)}`);
});