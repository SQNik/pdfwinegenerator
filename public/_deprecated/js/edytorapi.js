import * as PDFGeneratorAPI from "https://cdn.skypack.dev/pdf-generator-api-client@5.0.1";
import * as jose from "https://cdn.skypack.dev/jose@4.13.1";

const loadEditorBtn = document.querySelector("#load-editor-btn");
const apiKey = document.querySelector("#api-key");
const apiSecret = document.querySelector("#api-secret");
const apiWorkspace = document.querySelector("#api-workspace");
const apiTemplateId = document.querySelector("#api-templateid");
const apiData = document.querySelector("#api-data");

const defaultPDFAPIClient = PDFGeneratorAPI.ApiClient.instance;
let JSONWebTokenAuth = defaultPDFAPIClient.authentications["JSONWebTokenAuth"];

loadEditorBtn.addEventListener("click", (event) => {
  openEditor(
    apiKey.value,
    apiSecret.value,
    apiWorkspace.value,
    apiTemplateId.value,
    apiData.value ? JSON.parse(apiData.value) : { test: 1 }
  );
});

function openEditor(apiKey, apiSecret, apiWorkspace, templateId, data) {
  createTemplatesClient(apiKey, apiSecret, apiWorkspace).then((client) => {
    let request = new PDFGeneratorAPI.OpenEditorRequest();
    request.language = "en";
    request.data = data;

    client.openEditor(templateId, request, (error, data, response) => {
      if (error) {
        console.error(error);
      } else {
        document.querySelector("#editor-iframe").src = data.response;
        console.log(data);
      }
    });
  });
}

async function createTemplatesClient(apiKey, apiSecret, apiWorkspace) {
  JSONWebTokenAuth.accessToken = await createJWT(
    apiKey,
    apiWorkspace,
    apiSecret
  );
  return new PDFGeneratorAPI.TemplatesApi();
}

async function createDocumentClient(apiKey, apiSecret, apiWorkspace) {
  JSONWebTokenAuth.accessToken = await createJWT(
    apiKey,
    apiWorkspace,
    apiSecret
  );
  return new PDFGeneratorAPI.DocumentsApi();
}

async function createJWT(iss, sub, secret) {
  const header = {
    alg: "HS256",
    typ: "JWT"
  };

  const payload = {
    iss: iss,
    sub: sub,
    exp: Math.round(Date.now() / 1000) + 60
  };

  return await new jose.SignJWT(payload)
    .setProtectedHeader(header)
    .sign(new TextEncoder().encode(secret));
}
