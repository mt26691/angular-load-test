// cypress/support/commands.js

Cypress.Commands.add("uploadFile", (fileName, selector) => {
  cy.get(selector).then((subject) => {
    cy.fixture(fileName, "base64").then((content) => {
      const el = subject[0];
      const blob = Cypress.Blob.base64StringToBlob(content, "video/mp4");
      const file = new File([blob], fileName, { type: "video/mp4" });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      el.files = dataTransfer.files;
      cy.wrap(subject).trigger("change", { force: true });
    });
  });
});
