import { describe, it, expect } from "vitest";

interface Certificate {
  id: number;
  title: string;
  organization: string;
  file: string;
  date: string;
  display: "grid" | "modal" | "both";
  category: "Event" | "Learning" | "Certificate";
}

const mockCertificates: Certificate[] = [
  {
    id: 10,
    title: "IIIT Sricity Ideaverse",
    organization: "IIIT Sri City",
    file: "test.pdf",
    date: "2026",
    display: "both",
    category: "Event"
  },
  {
    id: 9,
    title: "Networking Engineer Intern",
    organization: "Global Info Sys",
    file: "test.pdf",
    date: "2026",
    display: "both",
    category: "Event"
  },
  {
    id: 36,
    title: "INFOVATE 2026 Paper Presentation",
    organization: "JP College of Engineering",
    file: "test.jpg",
    date: "2026",
    display: "both",
    category: "Event"
  },
  {
    id: 21,
    title: "ApoorvCTF'26",
    organization: "IIIT Allahabad",
    file: "test.pdf",
    date: "2026",
    display: "both",
    category: "Event"
  },
  {
    id: 1,
    title: "Computer Vision 101",
    organization: "Innomatics Research Labs",
    file: "test.pdf",
    date: "2026",
    display: "both",
    category: "Learning"
  },
  {
    id: 2,
    title: "Introduction to AI",
    organization: "Simplilearn",
    file: "test.pdf",
    date: "2026",
    display: "both",
    category: "Learning"
  },
  {
    id: 11,
    title: "Prelude",
    organization: "Innomatics",
    file: "test.pdf",
    date: "2026",
    display: "modal",
    category: "Certificate"
  },
  {
    id: 43,
    title: "ZYNEX 2K26 Paper Presentation",
    organization: "S.V.C. Engg Clg",
    file: "test.jpg",
    date: "2026",
    display: "modal",
    category: "Certificate"
  },
  {
    id: 14,
    title: "Satwa Round 1 Certificate",
    organization: "Satwa",
    file: "test.pdf",
    date: "2026",
    display: "modal",
    category: "Certificate"
  },
  {
    id: 15,
    title: "Certificate of Participation",
    organization: "Event",
    file: "test.pdf",
    date: "2026",
    display: "modal",
    category: "Certificate"
  },
];

function getGridCertificates(certs: Certificate[]) {
  return certs.filter(c => c.display === "grid" || c.display === "both");
}

function getModalCertificates(certs: Certificate[]) {
  return certs.filter(c => c.display === "modal" || c.display === "both");
}

function getAllCertificatesForModal(certs: Certificate[]) {
  const modalCerts = getModalCertificates(certs);
  const zynexCert = modalCerts.find(c => c.title === "ZYNEX 2K26 Paper Presentation");
  let zynexInserted = false;

  return modalCerts.flatMap(cert => {
    if (cert.title === "ApoorvCTF'26" && zynexCert && !zynexInserted) {
      zynexInserted = true;
      return [cert, { ...zynexCert }];
    }
    if (cert.title === "ZYNEX 2K26 Paper Presentation") {
      return [];
    }
    return cert;
  });
}

describe("Certificate filtering logic", () => {
  it("grid certificates includes both display types", () => {
    const grid = getGridCertificates(mockCertificates);
    expect(grid.length).toBe(6);
    grid.forEach(c => {
      expect(["grid", "both"]).toContain(c.display);
    });
  });

  it("modal certificates includes both display types", () => {
    const modal = getModalCertificates(mockCertificates);
    expect(modal.length).toBe(10);
    modal.forEach(c => {
      expect(["modal", "both"]).toContain(c.display);
    });
  });

  it("no duplicate certificates in modal output", () => {
    const allModal = getAllCertificatesForModal(mockCertificates);
    const titles = allModal.map(c => c.title);
    const uniqueTitles = new Set(titles);
    expect(uniqueTitles.size).toBe(titles.length);
  });

  it("grid certificates appear in modal (both display)", () => {
    const grid = getGridCertificates(mockCertificates);
    const modal = getModalCertificates(mockCertificates);
    grid.forEach(g => {
      expect(modal.map(m => m.id)).toContain(g.id);
    });
  });

  it("ZYNEX appears once, right after ApoorvCTF in modal", () => {
    const allModal = getAllCertificatesForModal(mockCertificates);
    const zynexIndex = allModal.findIndex(c => c.title === "ZYNEX 2K26 Paper Presentation");
    const apoorvIndex = allModal.findIndex(c => c.title === "ApoorvCTF'26");
    
    expect(zynexIndex).toBeGreaterThanOrEqual(0);
    expect(zynexIndex).toBe(apoorvIndex + 1);
  });

it("Satwa and Certificate of Participation follow ZYNEX in order", () => {
    const allModal = getAllCertificatesForModal(mockCertificates);
    const zynexIndex = allModal.findIndex(c => c.title === "ZYNEX 2K26 Paper Presentation");
    const satwaIndex = allModal.findIndex(c => c.title === "Satwa Round 1 Certificate");
    const participationIndex = allModal.findIndex(c => c.title === "Certificate of Participation");
    
    expect(zynexIndex).toBeGreaterThanOrEqual(0);
    expect(satwaIndex).toBeGreaterThan(zynexIndex);
    expect(participationIndex).toBeGreaterThan(satwaIndex);
  });

  it("no certificate has missing required fields", () => {
    mockCertificates.forEach(c => {
      expect(c.id).toBeDefined();
      expect(c.title).toBeTruthy();
      expect(c.file).toBeTruthy();
      expect(["grid", "modal", "both"]).toContain(c.display);
      expect(["Event", "Learning", "Certificate"]).toContain(c.category);
    });
  });

  it("all IDs are unique", () => {
    const ids = mockCertificates.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("no duplicate titles in source data", () => {
    const titles = mockCertificates.map(c => c.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});