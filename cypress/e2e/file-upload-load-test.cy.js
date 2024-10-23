describe("Concurrent Upload Load Test - 100 requests in 1 minute", () => {
  const numberOfUploads = 100;
  const fileName = "sample-10s-clip.mp4";
  const uploadSelector = 'input[type="file"]';

  let initialJobId = 0;

  // Load the app before running the test
  beforeEach(() => {
    cy.visit("http://localhost:4200"); // Replace with your app's URL
  });

  it(
    "should upload files concurrently and verify job IDs",
    { timeout: 60000 }, // Set a timeout of 60 seconds for this test
    () => {
      // Capture the initial job ID (first row in the table)
      cy.get(".file-list tbody tr:first-child td:first-child").then(
        ($firstCell) => {
          initialJobId = parseInt($firstCell.text().trim()) || 0;
          cy.log(`Initial Job ID: ${initialJobId}`);
        }
      );

      const uploadTasks = [];

      // Schedule 100 file uploads within a minute
      for (let i = 0; i < numberOfUploads; i++) {
        uploadTasks.push(
          cy.uploadFile(fileName, uploadSelector).then(() => {
            console.log(`Uploaded file ${i + 1}`);
          })
        );
      }

      // Wait for all uploads to complete
      cy.wrap(uploadTasks).then(() => {
        // Wait for 45 seconds to allow the job ID updates to be fully processed
        cy.wait(45000).then(() => {
          // Capture the new first row (latest job ID after all uploads)
          cy.get(".file-list tbody tr:first-child td:first-child").then(
            ($firstCell) => {
              const finalJobId = parseInt($firstCell.text().trim());
              cy.log(`Final Job ID: ${finalJobId}`);
              expect(finalJobId).to.equal(initialJobId + numberOfUploads);
            }
          );
        });
      });
    }
  );
});
