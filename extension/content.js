console.log("Email Writer Assistant Extension content script running...");

function creatAiButton() {
  const button = document.createElement("div");
  button.className = "T-I J-J5-Ji aoO v7 T-I-atl L3";

  button.style.marginRight = "8px";
  button.innerHTML = "AI Reply";
  button.setAttribute("role", "button");
  button.setAttribute("data-tooltip", "Generate AI Reply");

  return button;
}
function findComposeToolBar() {
  const selectors = [".btC", ".aDh", "[role='toolbar']", ".gU.Up"];
  for (const selector of selectors) {
    const toolbar = document.querySelector(selector);

    if (toolbar) {
      return toolbar;
    }
  }
  return null;
}
function getEmailContent() {
  const selectors = [
    ".h7",
    ".a3s.aiL",
    ".gmail_quote",
    '[role="presentation"]',
  ];

  for (const selector of selectors) {
    const emailContent = document.querySelector(selector);
    if (emailContent) {
      return emailContent.innerText || emailContent.textContent;
    }
  }
  return "";
}

function injectButton() {
  const existingButton = document.querySelector(".ai-reply-button");
  if (existingButton) existingButton.remove();
  const toolBar = findComposeToolBar();
  if (!toolBar) {
    console.log("Toolbar not found");
    return;
  }
  console.log("Toolbar found, creating ai reply button");

  const button = creatAiButton();
  button.classList.add("ai-reply-button");
  button.addEventListener("click", async () => {
    try {
      button.innerHTML = "Generating...";
      button.disabled = true;
      const emailContent = getEmailContent();
      const response = await fetch("http://localhost:8080/api/email/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailContent: emailContent,
          tone: "professional",
        }),
      });

      if (!response.ok) {
        throw new Error("Api request failed");
      }
      const generatedReply = await response.text();
      const composeBox = document.querySelector(
        '[role="textbox"][g_editable="true"]'
      );
      if (composeBox) {
        composeBox.focus();
        document.execCommand("insertText", false, generatedReply);
      } else {
        console.error("Compose box not found");
      }
    } catch (error) {
      console.log(error);
      alert("Error generating reply. Please try again.");
    } finally {
      button.innerHTML = "AI Reply";
      button.disabled = false;
    }
  });
  toolBar.insertBefore(button, toolBar.firstChild);
}

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    const addedNodes = Array.from(mutation.addedNodes);
    const hasComposeElement = addedNodes.some(
      (node) =>
        node.nodeType === Node.ELEMENT_NODE &&
        (node.matches('.aDh, .btc, [role="dialog"]') ||
          node.querySelector('.aDh, .btc, [role="dialog"]'))
    );

    if (hasComposeElement) {
      console.log("Compose element detected!");
      setTimeout(injectButton, 500);
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
