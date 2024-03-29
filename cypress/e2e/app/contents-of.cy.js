/// <reference types="cypress" />

describe("Seeing contents of a topic", () => {
  beforeEach(() => {
    cy.intercept(
      "GET",
      "https://us-east-2.aws.data.mongodb-api.com/app/data-tonat/endpoint/genkiI",
      {
        fixture: "collection.json",
      },
    ).as("fetchCollection");

    cy.visit("/");
    cy.getDataTest("sidemenu-button").click();
    cy.get("a").contains("See Contents").click();

    cy.wait("@fetchCollection");
  });

  it("can load the contents of chapter 1 vocabulary", () => {
    cy.get("select#chapter").select("Chapter 1");
    cy.get("select#topic").select("Vocabulary");
    cy.getDataTest("submit-button").click();

    cy.wait("@fetchCollection");

    cy.get("th").should("have.length", 5); // should be 5 attributes for vocabulary
    cy.get("tbody tr").should("have.length.at.least", 1);
  });

  it("can load the contents of chapter 2 numbers", () => {
    cy.get("select#chapter").select("Chapter 1");
    cy.get("select#topic").select("Vocabulary");
    cy.getDataTest("submit-button").click();

    cy.wait("@fetchCollection");

    cy.get("th").should("have.length", 5); // should be 5 attributes for numbers (uses same type as vocabulary)
    cy.get("tbody tr").should("have.length.at.least", 1);
  });

  it("can load the contents of chapter 3 kanji", () => {
    cy.get("select#chapter").select("Chapter 3");
    cy.get("select#topic").select("Kanji");
    cy.getDataTest("submit-button").click();

    cy.wait("@fetchCollection");

    cy.get("th").should("have.length", 4); // should be 4 attributes for kanji
    cy.get("tbody tr").should("have.length.at.least", 1);
  });

  it("can load the contents of chapter 3 conjugations", () => {
    cy.get("select#chapter").select("Chapter 3");
    cy.get("select#topic").select("Conjugations");
    cy.getDataTest("submit-button").click();
    cy.wait(1000); // wait for server

    cy.get("th").should("have.length", 5); // should be 5 attributes for conjugations
    cy.get("tbody tr").should("have.length.at.least", 1);
  });
});
