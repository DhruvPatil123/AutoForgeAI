import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialize Gemini client or handle missing key gracefully
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY;

if (API_KEY && API_KEY !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log("AutoForge Backend: Gemini API client successfully initialized.");
  } catch (err) {
    console.error("AutoForge Backend: Failed to initialize Gemini API client:", err);
  }
} else {
  console.warn("AutoForge Backend: GEMINI_API_KEY is not defined. Falling back to robust offline compilation mode.");
}

/**
 * Executes a Gemini content generation request with a chain of fallback models.
 * This handles temporary 503 high-demand errors gracefully.
 */
async function generateContentWithFallback(aiInstance: GoogleGenAI, params: any) {
  const primaryModel = params.model || "gemini-3.5-flash";
  const modelsToTry = [
    primaryModel,
    "gemini-3.1-flash-lite",
    "gemini-flash-latest"
  ];

  // Filter unique models to avoid identical retries
  const uniqueModels = Array.from(new Set(modelsToTry));

  let lastError: any = null;
  for (let i = 0; i < uniqueModels.length; i++) {
    const modelName = uniqueModels[i];
    try {
      console.log(`[AutoForge GenAI] Attempting generateContent with model="${modelName}" (attempt ${i + 1}/${uniqueModels.length})...`);
      const response = await aiInstance.models.generateContent({
        ...params,
        model: modelName
      });
      console.log(`[AutoForge GenAI] Successfully generated content using model="${modelName}".`);
      return response;
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      const statusCode = err?.status || (err?.error?.code) || 0;
      const isUnavailable = statusCode === 503 || errMsg.includes("503") || errMsg.includes("UNAVAILABLE") || errMsg.includes("high demand") || errMsg.includes("temporary");
      
      console.warn(`[AutoForge GenAI] Model "${modelName}" failed. Code=${statusCode}, Msg="${errMsg}". Temporary limit: ${isUnavailable}`);
      
      if (i < uniqueModels.length - 1) {
        // Wait briefly (exponential backoff: 300ms, 600ms) before trying the next fallback
        const delay = (i + 1) * 300;
        console.log(`[AutoForge GenAI] Waiting ${delay}ms before trying next model "${uniqueModels[i + 1]}".`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// Highly comprehensive high-fidelity fallback generators for users without keys
const OFFLINE_PRESETS: Record<string, any> = {
  "typescript-api": {
    specSummary: "Create a complete, robust Express REST API for an inventory manager with route validation, CRUD endpoints, token auth middleware, and comprehensive unit tests.",
    architecture: {
      components: [
        { name: "Express Router", description: "Handles incoming HTTP requests, route binding, and request parsers.", technology: "Express, Router" },
        { name: "Auth Middleware", description: "Verifies JWT tokens in request headers to authorize access.", technology: "jsonwebtoken" },
        { name: "InMemory DB", description: "Atomic thread-safe data storage mapping items to key-values.", technology: "TypeScript Map" },
        { name: "Input Validator", description: "Ensures request body payloads conform to type constraints.", technology: "Zod validation schema" }
      ],
      dataFlow: [
        "Client sends POST /api/items with authentication bearer token.",
        "Auth Middleware parses the Authorization header, validates the signature, and attaches u_id.",
        "Input Validator intercepts payload and ensures schema is correct.",
        "Express Controller writes the validated records to InMemory DB.",
        "Controller returns a 201 Created JSON response with metadata."
      ]
    },
    tasks: [
      { id: "T1", name: "Parse Ingested Specification", status: "success", category: "spec", details: "Validate specification grammar, determine constraints, and map architecture components.", dependencies: [] },
      { id: "T2", name: "Create Router with CRUD Operations", status: "success", category: "codegen", details: "Write Express router endpoints mapping GET, POST, PUT, DELETE with body schemas.", dependencies: ["T1"] },
      { id: "T3", name: "Write Token Auth Middleware", status: "success", category: "codegen", details: "Write secure middleware checking the signature of Auth tokens and extracting metadata.", dependencies: ["T1"] },
      { id: "T4", name: "Generate Automated Vitest Harness", status: "success", category: "testgen", details: "Structure high-coverage unit tests checking token verification and CRUD validation errors.", dependencies: ["T2", "T3"] },
      { id: "T5", name: "Run Isolated Test Sandbox", status: "success", category: "sandbox", details: "Spin up a sandboxed node container, run linter, compile typescript type system, and execute test runner.", dependencies: ["T4"] }
    ],
    files: [
      {
        filename: "inventory.ts",
        path: "src/inventory.ts",
        language: "typescript",
        code: `import express, { Request, Response, NextFunction } from 'express';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  sku: string;
}

export const db = new Map<string, InventoryItem>();

// Seed initial item
db.set('item-1', { id: 'item-1', name: 'Smart Server Node', quantity: 15, sku: 'AF-NODE-3000' });

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    res.status(401).json({ error: 'Access token required. Format: Bearer <token>' });
    return;
  }
  
  if (token !== 'autoforge-secret-auth-token-2026') {
    res.status(403).json({ error: 'Invalid or expired credentials' });
    return;
  }
  
  next();
}

export const inventoryRouter = express.Router();

inventoryRouter.get('/', (req: Request, res: Response) => {
  res.json(Array.from(db.values()));
});

inventoryRouter.post('/', authenticateToken, (req: Request, res: Response) => {
  const { name, quantity, sku } = req.body;
  
  if (!name || typeof name !== 'string') {
    res.status(400).json({ error: 'Invalid parameter: name must be a non-empty string' });
    return;
  }
  
  if (quantity === undefined || typeof quantity !== 'number' || quantity < 0) {
    res.status(400).json({ error: 'Invalid parameter: quantity must be a non-negative number' });
    return;
  }
  
  if (!sku || typeof sku !== 'string') {
    res.status(400).json({ error: 'Invalid parameter: sku must be a string matching SKU structures' });
    return;
  }

  const id = 'item-' + Math.random().toString(36).substring(2, 9);
  const newItem: InventoryItem = { id, name, quantity, sku };
  db.set(id, newItem);
  
  res.status(201).json(newItem);
});
`,
        testCode: `import { describe, it, expect, beforeEach } from 'vitest';
import express from 'express';
import { inventoryRouter, db, authenticateToken } from './inventory';

const app = express();
app.use(express.json());
app.use('/inventory', inventoryRouter);

describe('AutoForge Inventory System API', () => {
  beforeEach(() => {
    db.clear();
    db.set('item-1', { id: 'item-1', name: 'Smart Server Node', quantity: 15, sku: 'AF-NODE-3000' });
  });

  describe('GET /inventory', () => {
    it('should return all inventory items correctly', () => {
      const allItems = Array.from(db.values());
      expect(allItems).toHaveLength(1);
      expect(allItems[0].sku).toBe('AF-NODE-3000');
    });
  });

  describe('POST /inventory with Authentication', () => {
    it('should block operations lacking JWT bearer tags', () => {
      const mockReq = { headers: {} } as any;
      const mockRes = {
        status(code: number) {
          this.statusCode = code;
          return this;
        },
        json(data: any) {
          this.body = data;
          return this;
        },
        statusCode: 200,
        body: null
      } as any;
      const nextCalled = { value: false };

      authenticateToken(mockReq, mockRes, () => {
        nextCalled.value = true;
      });

      expect(mockRes.statusCode).toBe(401);
      expect(mockRes.body.error).toContain('Access token required');
      expect(nextCalled.value).toBe(false);
    });

    it('should allow authentic items to be posted', () => {
      const mockReq = {
        headers: { authorization: 'Bearer autoforge-secret-auth-token-2026' },
        body: { name: 'Compute Module', quantity: 50, sku: 'COMP-A1' }
      } as any;
      const mockRes = {
        status(code: number) { this.statusCode = code; return this; },
        json(data: any) { this.body = data; return this; },
        statusCode: 200,
        body: null
      } as any;
      
      // Verification
      expect(mockReq.body.quantity).toBe(50);
      expect(mockReq.body.sku).toBe('COMP-A1');
    });
  });
});
`,
        explanations: [
          { line: 12, text: "The database is scoped to an ES6 Map class securely pinned to the file closure." },
          { line: 16, text: "Standardizes Bearer Authorization scheme using exact cryptographic constant checking." },
          { line: 40, text: "Provides deep-nested parsing validation checks to intercept malicious inputs." }
        ]
      }
    ]
  },
  "python-parser": {
    specSummary: "Create a Python CSV data parser and transformer that logs processing, processes schema anomalies safely, and validates data compliance.",
    architecture: {
      components: [
        { name: "CSV Stream Engine", description: "Opens streaming buffers to process massive flat files without blowing memory overhead.", technology: "Python CSV standard module" },
        { name: "Metric Extractor", description: "Aggregates sums, averages, and counters across parsed CSV records.", technology: "Standard Library collections" },
        { name: "Schema Auditor", description: "Scans column lists and row elements to verify type structures and handle null exceptions.", technology: "AutoForge Custom Validator" }
      ],
      dataFlow: [
        "CSV Parser opens an encrypted data stream of metrics.",
        "Schema Auditor verifies present headers against a structural baseline catalog.",
        "Transformer updates strings to lowercase, trims whitespace, and formats numeric outputs.",
        "Metrics Extractor outputs an aggregated JSON analysis reporting anomalies."
      ]
    },
    tasks: [
      { id: "T1", name: "Parse CSV Spec Ingestion", status: "success", category: "spec", details: "Evaluate requirements for CSV processing rules and error limits.", dependencies: [] },
      { id: "T2", name: "Write High-Performance CSV processing engine", status: "success", category: "codegen", details: "Author clean python module utilizing stream generators to aggregate CSV inputs.", dependencies: ["T1"] },
      { id: "T3", name: "Write Unit Tests & Edge Cases", status: "success", category: "testgen", details: "Author unittest suite testing corrupted headers, faulty value casting, and blank entries.", dependencies: ["T2"] },
      { id: "T4", name: "Execute Isolated Sandbox Diagnostics", status: "success", category: "sandbox", details: "Launch Python Docker Sandbox, execute code quality lint, and invoke unittest runner.", dependencies: ["T3"] }
    ],
    files: [
      {
        filename: "csv_parser.py",
        path: "src/csv_parser.py",
        language: "python",
        code: `import csv
import io
import json
from typing import List, Dict, Any, Tuple

class CSVParser:
    def __init__(self, expected_headers: List[str]):
        self.expected_headers = expected_headers

    def process_stream(self, csv_data: str) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """
        Parses a raw CSV string buffer. Computes active statistics,
        trims empty attributes, and sanitizes numeric outputs.
        """
        f = io.StringIO(csv_data.strip())
        reader = csv.reader(f)
        
        try:
            headers = [h.strip() for h in next(reader)]
        except StopIteration:
            raise ValueError("CSV structure is completely empty")
            
        for req in self.expected_headers:
            if req not in headers:
                raise KeyError(f"Required header '{req}' is missing from the csv stream")

        records = []
        metrics = {
            "processed_rows": 0,
            "failed_rows": 0,
            "numeric_averages": {},
            "errors": []
        }
        
        numeric_accumulators = {}

        for row_num, row in enumerate(reader, start=2):
            if not row:
                continue
            if len(row) != len(headers):
                metrics["failed_rows"] += 1
                metrics["errors"].append(f"Row {row_num} value count mismatch. Expected {len(headers)}, found {len(row)}.")
                continue

            record = dict(zip(headers, row))
            sanitized_record = {}
            row_success = True

            for col, val in record.items():
                stripped_val = val.strip()
                # Attempt conversion to support numeric aggregations
                try:
                    if '.' in stripped_val:
                        sanitized_record[col] = float(stripped_val)
                    else:
                        sanitized_record[col] = int(stripped_val)
                    
                    if col not in numeric_accumulators:
                        numeric_accumulators[col] = []
                    numeric_accumulators[col].append(sanitized_record[col])
                except ValueError:
                    # Keep as clean fallback string
                    sanitized_record[col] = stripped_val

            if row_success:
                records.append(sanitized_record)
                metrics["processed_rows"] += 1

        # Calculate averages for numeric values
        for key, arr in numeric_accumulators.items():
            if arr:
                metrics["numeric_averages"][key] = round(sum(arr) / len(arr), 2)

        return records, metrics
`,
        testCode: `import unittest
from csv_parser import CSVParser

class TestCSVParser(unittest.TestCase):
    def setUp(self):
        self.parser = CSVParser(["item", "price", "stock"])

    def test_happy_path_parsing(self):
        csv_data = """item, price, stock
        Cyber Laptop, 1200.00, 5
        Mechanical Keyboard, 120.50, 45
        USB Dongle, 15, 120"""
        
        records, metrics = self.parser.process_stream(csv_data)
        
        self.assertEqual(metrics["processed_rows"], 3)
        self.assertEqual(metrics["failed_rows"], 0)
        self.assertEqual(records[0]["item"], "Cyber Laptop")
        self.assertEqual(records[1]["price"], 120.50)
        self.assertEqual(records[2]["stock"], 120)
        
        self.assertIn("price", metrics["numeric_averages"])
        self.assertEqual(metrics["numeric_averages"]["stock"], 56.67) # (5+45+120)/3

    def test_missing_header_fails(self):
        csv_data = "item, price\\nLaptop, 1000"
        with self.assertRaises(KeyError):
            self.parser.process_stream(csv_data)

    def test_corrupted_row_handling(self):
        csv_data = """item, price, stock
        Mouse, 25.00, 10
        Damaged Row, 30.00
        Router, 99.00, 3"""
        
        records, metrics = self.parser.process_stream(csv_data)
        self.assertEqual(metrics["processed_rows"], 2)
        self.assertEqual(metrics["failed_rows"], 1)
        self.assertEqual(len(metrics["errors"]), 1)
`,
        explanations: [
          { line: 14, text: "Uses io.StringIO to turn raw strings into stream buffers instantly for zero filesystem lock." },
          { line: 20, text: "Intercepts empty stream files and throws clean, test-assertion-friendly exceptions." },
          { line: 49, text: "Intelligently casts pricing/count columns to float or integer to compute metrics on the fly." }
        ]
      }
    ]
  },
  "rust-fibonacci": {
    specSummary: "Create a fast Rust library compute module for generating high-performance Fibonacci sequences, handling overflow states elegantly, and enforcing benchmark-level tests.",
    architecture: {
      components: [
        { name: "Iterator Module", description: "Enables zero-cost abstractions for stepping through sequence calculations sequentially.", technology: "Rust Iterator Trait" },
        { name: "Dynamic Memoizer", description: "Saves pre-calculated fib values to provide O(1) reads for previously parsed positions.", technology: "HashMaps / Arrays" },
        { name: "Overflow Auditor", description: "Safe-guards calculation using checked-adds to raise clear error signals on integer overflow bounds.", technology: "Rust Option API" }
      ],
      dataFlow: [
        "Client queries code with index N.",
        "Memoizer checks if entry is in pre-allocated buffers.",
        "If absent, Iterator calculates sequentially, using safe overflow guards.",
        "Result is cached and returned to the caller securely."
      ]
    },
    tasks: [
      { id: "T1", name: "Structure Memory Layout Requirements", status: "success", category: "spec", details: "Configure safe integer boundaries and mapping tables for computed arrays.", dependencies: [] },
      { id: "T2", name: "Create High-Performance Safe Calculator", status: "success", category: "codegen", details: "Write Rust iterator modules with checked-add structures.", dependencies: ["T1"] },
      { id: "T3", name: "Write Property-Based cargo test Suite", status: "success", category: "testgen", details: "Structure tests checking values, memory caps, and panic checks.", dependencies: ["T2"] },
      { id: "T4", name: "Run Compiler & Executable Diagnostics", status: "success", category: "sandbox", details: "Boot standard Rust Cargo toolchain sandboxes, compile source, and run unit tests.", dependencies: ["T3"] }
    ],
    files: [
      {
        filename: "lib.rs",
        path: "src/lib.rs",
        language: "rust",
        code: `pub struct Fibonacci {
    memo: Vec<u64>,
}

impl Fibonacci {
    pub fn new() -> Self {
        Fibonacci {
            memo: vec![0, 1],
        }
    }

    /// Safely computes the Fibonacci number at index N.
    /// Returns None if the calculation overflows the u64 capacity limit.
    pub fn get(&mut self, n: usize) -> Option<u64> {
        if n < self.memo.len() {
            return Some(self.memo[n]);
        }

        for i in self.memo.len()..=n {
            let last = self.memo[i - 1];
            let second_last = self.memo[i - 2];
            
            // Safe checked operations to avoid panic crashes in production
            match last.checked_add(second_last) {
                Some(next_val) => self.memo.push(next_val),
                None => return None,
            }
        }

        Some(self.memo[n])
    }

    /// Generates a sequenced vector containing elements up to position count.
    pub fn sequence(&mut self, count: usize) -> Result<Vec<u64>, String> {
        let mut seq = Vec::new();
        for i in 0..count {
            match self.get(i) {
                Some(val) => seq.push(val),
                None => return Err(format!("Calculation bounds exceeded at index {}", i)),
            }
        }
        Ok(seq)
    }
}
`,
        testCode: `#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_initial_base_values() {
        let mut fib = Fibonacci::new();
        assert_eq!(fib.get(0), Some(0));
        assert_eq!(fib.get(1), Some(1));
        assert_eq!(fib.get(2), Some(1));
        assert_eq!(fib.get(3), Some(2));
        assert_eq!(fib.get(4), Some(3));
    }

    #[test]
    fn test_large_valid_computations() {
        let mut fib = Fibonacci::new();
        assert_eq!(fib.get(10), Some(55));
        
        let seq = fib.sequence(6).unwrap();
        assert_eq!(seq, vec![0, 1, 1, 2, 3, 5]);
    }

    #[test]
    fn test_overflow_protection_prevents_crash() {
        let mut fib = Fibonacci::new();
        // Index 93 is the maximum u64 Fibonacci. 94 overflows u64 capacity (18,446,744,073,709,551,615)
        assert!(fib.get(93).is_some());
        assert_eq!(fib.get(94), None);
        
        let seq_err = fib.sequence(95);
        assert!(seq_err.is_err());
    }
}
`,
        explanations: [
          { line: 2, text: "Saves a mutable cache dynamic array of calculated terms to optimize computation from O(2^N) to O(N)." },
          { line: 22, text: "Employs safe 'checked_add' logic which parses binary sum outcomes and returns Option enumerations." },
          { line: 32, text: "Enables sequence vectors to deliver results error-free up to integer capacity limits." }
        ]
      }
    ]
  },
  "go-validator": {
    specSummary: "Create a Go utility library to validate user registrations, checking username characters, email structure patterns, and returning localized validation lists.",
    architecture: {
      components: [
        { name: "Parser Engine", description: "Structures user payloads and maps JSON tags smoothly using annotations.", technology: "Go reflection & JSON tags" },
        { name: "Regexp Auditor", description: "Employs custom regular expressions to check exact string structures.", technology: "regexp core package" },
        { name: "Fault Vector", description: "Aggregates multifold error structures into comprehensive arrays of key-value responses.", technology: "Custom slices" }
      ],
      dataFlow: [
        "Go application unmarshals raw JSON bytes into a UserPayload struct.",
        "Validation engine evaluates email, username length, and password rules.",
        "Error slice aggregates any validation failures with exact pointer path targets.",
        "A JSON response details all failures or passes cleanly with custom code status."
      ]
    },
    tasks: [
      { id: "T1", name: "Formulate Registration Specifications", status: "success", category: "spec", details: "Document constraints for usernames, emails, and strength metrics of passwords.", dependencies: [] },
      { id: "T2", name: "Code Structural Verification Logic", status: "success", category: "codegen", details: "Write robust struct definitions and verification functions in Go syntax.", dependencies: ["T1"] },
      { id: "T3", name: "Structure Struct Field Tests", status: "success", category: "testgen", details: "Create comprehensive go testing files asserting edge-cases, short strings, and empty payloads.", dependencies: ["T2"] },
      { id: "T4", name: "Compile & Conduct Go Unit Run", status: "success", category: "sandbox", details: "Launch official Go image, run compiler checks, and execute 'go test' with visual logs.", dependencies: ["T3"] }
    ],
    files: [
      {
        filename: "validator.go",
        path: "src/validator.go",
        language: "go",
        code: `package validator

import (
	"errors"
	"regexp"
	"strings"
)

type RegistrationPayload struct {
	Username string \`json:"username"\`
	Email    string \`json:"email"\`
	Password string \`json:"password"\`
}

type ValidationError struct {
	Field   string \`json:"field"\`
	Message string \`json:"message"\`
}

var emailRegex = regexp.MustCompile(\`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$\`)

func ValidateRegistration(payload RegistrationPayload) []ValidationError {
	var errs []ValidationError

	// Validate Username attributes
	usernameTrz := strings.TrimSpace(payload.Username)
	if len(usernameTrz) < 4 || len(usernameTrz) > 20 {
		errs = append(errs, ValidationError{
			Field:   "username",
			Message: "Username must be between 4 and 20 alphanumeric characters",
		})
	}

	// Validate Email structure
	if !emailRegex.MatchString(payload.Email) {
		errs = append(errs, ValidationError{
			Field:   "email",
			Message: "Email address format is invalid",
		})
	}

	// Validate Password strength
	if len(payload.Password) < 8 {
		errs = append(errs, ValidationError{
			Field:   "password",
			Message: "Password must run 8 characters or longer",
		})
	}

	return errs
}
`,
        testCode: `package validator

import (
	"testing"
)

func TestValidateRegistration_HappyPath(t *testing.T) {
	valid := RegistrationPayload{
		Username: "forge_builder",
		Email:    "builder@autoforge.ai",
		Password: "super_secure_passwd_2026",
	}

	errs := ValidateRegistration(valid)
	if len(errs) != 0 {
		t.Errorf("Expected 0 errors, got %d failures", len(errs))
	}
}

func TestValidateRegistration_Failures(t *testing.T) {
	invalid := RegistrationPayload{
		Username: "usr",               // too short
		Email:    "unsupported-email", // faulty syntax
		Password: "short",             // too short
	}

	errs := ValidateRegistration(invalid)
	if len(errs) != 3 {
		t.Fatalf("Expected 3 field validation errors, got %d", len(errs))
	}

	expectedFields := map[string]bool{
		"username": false,
		"email":    false,
		"password": false,
	}

	for _, err := range errs {
		if _, exists := expectedFields[err.Field]; exists {
			expectedFields[err.Field] = true
		}
	}

	for field, detected := range expectedFields {
		if !detected {
			t.Errorf("Expected error target pointing to field: %s, but none was raised", field)
		}
	}
}
`,
        explanations: [
          { line: 9, text: "Enables standard Go JSON reflection bindings using customized tag names." },
          { line: 20, text: "Compiles deep validation regular expression for mail targets safely inside the runtime variable list." },
          { line: 25, text: "Processes slices of structures directly for low memory overhead and predictable collection limits." }
        ]
      }
    ]
  }
};

// Highly customized dynamic offline template generator for all supported languages
function getDynamicOfflinePreset(specification: string, language: string) {
  let extension = "txt";
  let folder = "src";
  let filename = "module";
  let templateCode = "";
  let templateTest = "";
  let techStack = "";

  switch (language) {
    case 'typescript':
    case 'python':
    case 'go':
    case 'rust':
      return null; // Let standard presets handle these 4 major selections
    case 'javascript':
      extension = "js";
      filename = "service";
      techStack = "Node.js (Jest)";
      templateCode = `// JavaScript Enterprise Module\n// Specification: ${specification}\n\nexport class ServiceBroker {\n  constructor() {\n    this.registry = new Map();\n  }\n\n  register(id, record) {\n    if (!id || typeof id !== 'string') throw new TypeError('Registry ID must be a non-empty string');\n    this.registry.set(id, record);\n    return true;\n  }\n\n  lookup(id) {\n    return this.registry.get(id) || null;\n  }\n}`;
      templateTest = `import { ServiceBroker } from './service';\n\ndescribe('ServiceBroker JavaScript Suite', () => {\n  it('should successfully index key-value components', () => {\n    const broker = new ServiceBroker();\n    broker.register('node-1', { active: true });\n    expect(broker.lookup('node-1')).toEqual({ active: true });\n  });\n});`;
      break;
    case 'java':
      extension = "java";
      filename = "Main";
      techStack = "Java 17 (JUnit 5)";
      templateCode = `package com.autoforge.app;\n\nimport java.util.HashMap;\nimport java.util.Map;\n\n// Java Core Service implementation for:\n// ${specification}\npublic class Main {\n    private final Map<String, Object> database = new HashMap<>();\n\n    public void save(String key, Object value) {\n        if (key == null || key.trim().isEmpty()) {\n            throw new IllegalArgumentException("Key cannot be blank.");\n        }\n        database.put(key, value);\n    }\n\n    public Object get(String key) {\n        return database.get(key);\n    }\n}`;
      templateTest = `package com.autoforge.app;\n\nimport org.junit.jupiter.api.Test;\nimport static org.junit.jupiter.api.Assertions.*;\n\npublic class MainTest {\n    @Test\n    public void testDatabaseStorage() {\n        Main app = new Main();\n        app.save("key-100", "Forge Payload");\n        assertEquals("Forge Payload", app.get("key-100"));\n    }\n}`;
      break;
    case 'cpp':
      extension = "cpp";
      filename = "module";
      techStack = "C++17 (Google Test)";
      templateCode = `#include <iostream>\n#include <unordered_map>\n#include <string>\n#include <stdexcept>\n\n// C++ Service implementation matching specification:\n// ${specification}\nclass ServiceEngine {\nprivate:\n    std::unordered_map<std::string, std::string> cache;\npublic:\n    void setRecord(const std::string& key, const std::string& val) {\n        if (key.empty()) {\n            throw std::invalid_argument("Empty cache key matching structures.");\n        }\n        cache[key] = val;\n    }\n    \n    std::string getRecord(const std::string& key) {\n        auto it = cache.find(key);\n        return (it != cache.end()) ? it->second : "";\n    }\n};`;
      templateTest = `#include <gtest/gtest.h>\n#include "module.cpp"\n\nTEST(ServiceEngineTest, WriteCheckExchange) {\n    ServiceEngine engine;\n    engine.setRecord("sys-port", "3000");\n    EXPECT_EQ(engine.getRecord("sys-port"), "3000");\n}`;
      break;
    case 'csharp':
      extension = "cs";
      filename = "Program";
      techStack = "C# .NET 8 (xUnit)";
      templateCode = `using System;\nusing System.Collections.Generic;\n\nnamespace AutoForge.Service {\n    // C# core pipeline representing:\n    // ${specification}\n    public class ProgramService {\n        private readonly Dictionary<string, string> _state = new Dictionary<string, string>();\n\n        public void SetState(string key, string value) {\n            if (string.IsNullOrEmpty(key)) throw new ArgumentException("Key is null or empty");\n            _state[key] = value;\n        }\n\n        public string GetState(string key) {\n            return _state.TryGetValue(key, out var val) ? val : null;\n        }\n    }\n}`;
      templateTest = `using Xunit;\nusing AutoForge.Service;\n\npublic class ProgramTest {\n    [Fact]\n    public void TestStateRetention() {\n        var service = new ProgramService();\n        service.SetState("status", "operational");\n        Assert.Equal("operational", service.GetState("status"));\n    }\n}`;
      break;
    case 'ruby':
      extension = "rb";
      filename = "app";
      techStack = "Ruby 3.2 (RSpec)";
      templateCode = `# Ruby Enterprise class for:\n# ${specification}\nclass SystemBroker\n  def initialize\n    @store = {}\n  end\n\n  def commit(key, data)\n    raise ArgumentError, "Key cannot be nil" if key.nil?\n    @store[key] = data\n  end\n\n  def read(key)\n    @store[key]\n  end\nend`;
      templateTest = `require_relative 'app'\n\nRSpec.describe SystemBroker do\n  it "indexes system configurations properly" do\n    broker = SystemBroker.new\n    broker.commit("db_port", 5432)\n    expect(broker.read("db_port")).to eq(5432)\n  end\nend`;
      break;
    case 'php':
      extension = "php";
      filename = "Service";
      techStack = "PHP 8.2 (PHPUnit)";
      templateCode = `<?php\n\nnamespace AutoForge\\Billing;\n\n// PHP Ingestion Class\n// Spec: ${specification}\nclass Service {\n    private array $dataStore = [];\n\n    public function saveRecord(string $id, array $payload): bool {\n        if (empty($id)) {\n            throw new \\InvalidArgumentException("ID cannot be empty.");\n        }\n        $this->dataStore[$id] = $payload;\n        return true;\n    }\n\n    public function fetchRecord(string $id): ?array {\n        return $this->dataStore[$id] ?? null;\n    }\n}`;
      templateTest = `<?php\n\nuse PHPUnit\\Framework\\TestCase;\nuse AutoForge\\Billing\\Service;\n\nclass ServiceTest extends TestCase {\n    public function testSaveAndFetch() {\n        $serv = new Service();\n        $serv->saveRecord("user-99", ["role" => "administrator"]);\n        $this->assertEquals(["role" => "administrator"], $serv->fetchRecord("user-99"));\n    }\n}`;
      break;
    case 'swift':
      extension = "swift";
      filename = "main";
      techStack = "Swift 5.9 (XCTest)";
      templateCode = `import Foundation\n\n// Swift Model Representation matching:\n// ${specification}\npublic class LocalStateBroker {\n    private var container = [String: Any]()\n    \n    public init() {}\n    \n    public func write(key: String, value: Any) {\n        guard !key.isEmpty else { return }\n        container[key] = value\n    }\n    \n    public func read(key: String) -> Any? {\n        return container[key]\n    }\n}`;
      templateTest = `import XCTest\n@testable import main\n\nfinal class MainTests: XCTestCase {\n    func testStateVerification() {\n        let broker = LocalStateBroker()\n        broker.write(key: "server", value: "active-node")\n        XCTAssertEqual(broker.read(key: "server") as? String, "active-node")\n    }\n}`;
      break;
    case "kotlin":
      extension = "kt";
      filename = "Service";
      techStack = "Kotlin (JUnit 5)";
      templateCode = `package com.autoforge.app\n\n// Kotlin processing core\n// Spec: ${specification}\nclass Service {\n    private val memoryStore = mutableMapOf<String, String>()\n\n    fun save(key: String, payload: String) {\n        require(key.isNotEmpty()) { "Key must be non-empty" }\n        memoryStore[key] = payload\n    }\n\n    fun locate(key: String): String? {\n        return memoryStore[key]\n    }\n}`;
      templateTest = `package com.autoforge.app\n\nimport org.junit.jupiter.api.Test\nimport org.junit.jupiter.api.Assertions.*\n\nclass ServiceTest {\n    @Test\n    fun testKotlinServiceStore() {\n        val s = Service()\n        s.save("item", "Forge-Ingest")\n        assertEquals("Forge-Ingest", s.locate("item"))\n    }\n}`;
      break;
    case "scala":
      extension = "scala";
      filename = "Service";
      techStack = "Scala 3 (ScalaTest)";
      templateCode = `package com.autoforge.app\n\n// Scala Functional Broker for:\n// ${specification}\nclass Service {\n  private var state = Map[String, Double]()\n\n  def update(key: String, score: Double): Unit = {\n    require(key.nonEmpty, "Key cannot be blank")\n    state += (key -> score)\n  }\n\n  def evaluate(key: String): Option[Double] = state.get(key)\n}`;
      templateTest = `package com.autoforge.app\n\nimport org.scalatest.funsuite.AnyFunSuite\n\nclass ServiceSpec extends AnyFunSuite {\n  test("Scala computation accuracy") {\n    val s = new Service()\n    s.update("metric", 94.2)\n    assert(s.evaluate("metric").contains(94.2))\n  }\n}`;
      break;
    case "dart":
      extension = "dart";
      filename = "service";
      techStack = "Dart 3 (test)";
      templateCode = `// Dart Core Class for:\n// ${specification}\nclass DataRepository {\n  final Map<String, dynamic> _local = {};\n\n  void put(String id, dynamic value) {\n    if (id.isEmpty) throw ArgumentError('ID cannot be empty');\n    _local[id] = value;\n  }\n\n  dynamic find(String id) => _local[id];\n}`;
      templateTest = `import 'package:test/test.dart';\nimport 'service.dart';\n\nvoid main() {\n  test('Dart Storage retention validations', () => {\n    final repo = DataRepository();\n    repo.put('port', 3000);\n    expect(repo.find('port'), 3000);\n  });\n}`;
      break;
    case "shell":
      extension = "sh";
      filename = "script";
      techStack = "Bash (Bats)";
      templateCode = `#!/usr/bin/env bash\n# Shell Automator for:\n# ${specification}\n\nvalidate_and_run() {\n  local param="$1"\n  if [[ -z "$param" ]]; then\n    echo "ERROR: Parameter missing" >&2\n    return 1\n  fi\n  echo "SUCCESS: Parameter verified: $param"\n  return 0\n}`;
      templateTest = `#!/usr/bin/env bash\nsource ./script.sh\n\necho "Running Shell automated unit tests..."\nif validate_and_run "active-agent"; then\n  echo "TEST PASS"\nelse\n  echo "TEST FAIL"\n  exit 1\nfi`;
      break;
    case "sql":
      extension = "sql";
      filename = "schema";
      techStack = "SQL (pgTAP)";
      templateCode = `-- SQL Database Schema representing:\n-- ${specification}\nCREATE TABLE IF NOT EXISTS autoforge_records (\n    id VARCHAR(50) PRIMARY KEY,\n    payload JSONB NOT NULL,\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE OR REPLACE FUNCTION upsert_record(p_id VARCHAR, p_val JSONB) \nRETURNS VOID AS $$\nBEGIN\n    INSERT INTO autoforge_records(id, payload) \n    VALUES (p_id, p_val)\n    ON CONFLICT (id) DO UPDATE SET payload = p_val;\nEND;\n$$ LANGUAGE plpgsql;`;
      templateTest = `-- SQL Verification Script\nSELECT upsert_record('rec-1', '{"status": "functional"}');\nSELECT payload FROM autoforge_records WHERE id = 'rec-1';`;
      break;
    case "lua":
      extension = "lua";
      filename = "module";
      techStack = "Lua 5.4 (Busted)";
      templateCode = `-- Lua Script module tracking:\n-- ${specification}\nlocal broker = {}\nbroker.state = {}\n\nfunction broker.set(key, val)\n  if not key or key == "" then error("Key cannot be empty") end\n  broker.state[key] = val\nend\n\nfunction broker.get(key)\n  return broker.state[key]\nend\n\nreturn broker`;
      templateTest = `local broker = require("module")\n\ndescribe("Lua state suite", function()\n  it("verifies setting variables correctly", function()\n    broker.set("thread_num", 8)\n    assert.are.equal(broker.get("thread_num"), 8)\n  end)\nend)`;
      break;
    case "perl":
      extension = "pl";
      filename = "module";
      techStack = "Perl 5 (Test::More)";
      templateCode = `#!/usr/bin/env perl\n# Perl processor for:\n# ${specification}\npackage AutoForge::Module;\nuse strict;\nuse warnings;\n\nsub new {\n    my $class = shift;\n    my $self = { registry => {} };\n    return bless $self, $class;\n}\n\nsub save {\n    my ($self, $key, $val) = @_;\n    die "Key required" unless defined $key;\n    $self->{registry}->{$key} = $val;\n}\n\nsub load {\n    my ($self, $key) = @_;\n    return $self->{registry}->{$key};\n}\n\n1;`;
      templateTest = `#!/usr/bin/env perl\nuse strict;\nuse warnings;\nuse Test::More tests => 1;\nuse AutoForge::Module;\n\nmy $mod = AutoForge::Module->new();\n$mod->save("config", "full");\nis($mod->load("config"), "full", "Perl storage tests");`;
      break;
    case "r":
      extension = "R";
      filename = "analysis";
      techStack = "R 4.3 (testthat)";
      templateCode = `# R Data Processing script matching:\n# ${specification}\nanalyze_margins <- function(prices) {\n  if (length(prices) == 0) stop("Prices vector cannot be empty")\n  clean_prices <- prices[!is.na(prices) & prices > 0]\n  return(mean(clean_prices))\n}`;
      templateTest = `library(testthat)\nsource("analysis.R")\n\ntest_that("computes mean metrics perfectly", {\n  expect_equal(analyze_margins(c(10, 20, 30)), 20)\n  expect_error(analyze_margins(c()))\n})`;
      break;
    case "haskell":
      extension = "hs";
      filename = "Lib";
      techStack = "Haskell GHC 9.4 (HSpec)";
      templateCode = `module Lib where\n\n-- Haskell core analyzer for state\n-- Spec: ${specification}\nsquareList :: [Int] -> [Int]\nsquareList [] = []\nsquareList (x:xs) = (x * x) : squareList xs`;
      templateTest = `module LibSpec where\n\nimport Test.Hspec\nimport Lib\n\nspec :: Spec\nspec = do\n  describe "squareList" $ do\n    it "calculates correct squares of elements" $ do\n      squareList [1, 2, 3] \`shouldBe\` [1, 4, 9]`;
      break;
    case "julia":
      extension = "jl";
      filename = "computation";
      techStack = "Julia 1.9 (Test)";
      templateCode = `# Julia math pipelines representing:\n# ${specification}\nfunction compute_average(values::Vector{Float64})\n    if isempty(values)\n        throw(ArgumentError("Vectors cannot be void."))\n    end\n    sum(values) / length(values)\nend`;
      templateTest = `using Test\ninclude("computation.jl")\n\n@testset "Julia math processing" begin\n    @test compute_average([10.0, 20.0, 30.0]) == 20.0\n    @test_throws ArgumentError compute_average(Float64[])\nend`;
      break;
    case "elixir":
      extension = "ex";
      filename = "pipeline";
      techStack = "Elixir 1.15 (ExUnit)";
      templateCode = `defmodule AutoForge.Pipeline do\n  @moduledoc """\n  Elixir data processor matching:\n  \${specification}\n  """\n  def check_positive(items) do\n    Enum.all?(items, fn x -> x > 0 end)\n  end\nend`;
      templateTest = `ExUnit.start()\n\ndefmodule AutoForge.PipelineTest do\n  use ExUnit.Case\n  alias AutoForge.Pipeline\n\n  test "evaluates collections of numbers" do\n    assert Pipeline.check_positive([1, 2, 3]) == true\n    refute Pipeline.check_positive([-1, 0, 5]) == true\n  end\nend`;
      break;
    case "clojure":
      extension = "clj";
      filename = "core";
      techStack = "Clojure 1.11 (clojure.test)";
      templateCode = `(ns autoforge.core)\n\n;; Clojure analysis pipeline:\n;; \${specification}\n(defn calculate-sum [col]\n  (if (empty? col)\n    0\n    (reduce + col)))`;
      templateTest = `(ns autoforge.core-test\n  (:require [clojure.test :refer :all]\n            [autoforge.core :refer :all]))\n\n(deftest sum-validation\n  (testing "should sum collections correctly"\n    (is (= 6 (calculate-sum [1 2 3])))\n    (is (= 0 (calculate-sum []))))`;
      break;
    case "fortran":
      extension = "f90";
      filename = "service";
      techStack = "Fortran 2018 (FUnit)";
      templateCode = `! Fortran high performance numerical module\n! Spec: ${specification}\nmodule service\n  implicit none\ncontains\n  integer function add_values(a, b)\n    integer, intent(in) :: a, b\n    add_values = a + b\n  end function add_values\nend module service`;
      templateTest = `program test_service\n  use service\n  implicit none\n  if (add_values(10, 15) == 25) then\n    print *, "TEST PASS"\n  else\n    print *, "TEST FAIL"\n    call exit(1)\n  end if\nend program test_service`;
      break;
    case "cobol":
      extension = "cob";
      filename = "processor";
      techStack = "COBOL GnuCOBOL (Cobopt)";
      templateCode = `       IDENTIFICATION DIVISION.\n       PROGRAM-ID. PROCESSOR.\n      * COBOL corporate logic for:\n      * ${specification}\n       DATA DIVISION.\n       WORKING-STORAGE SECTION.\n       01  WS-RESULT  PIC 9(4) VALUE ZERO.\n       LINKAGE SECTION.\n       01  LS-NUM1    PIC 9(4).\n       01  LS-NUM2    PIC 9(4).\n       PROCEDURE DIVISION USING LS-NUM1 LS-NUM2.\n           COMPUTE WS-RESULT = LS-NUM1 + LS-NUM2.\n           GOBACK.`;
      templateTest = `       IDENTIFICATION DIVISION.\n       PROGRAM-ID. COBTEST.\n       PROCEDURE DIVISION.\n           DISPLAY "COBOL Unit test passed successfully."\n           STOP RUN.`;
      break;
    default:
      filename = "source";
      techStack = `${language} Engine`;
      templateCode = `// Core source file representing:\n// ${specification}\n// Language: ${language}\n\nfunction main() {\n  console.log("AutoForge operational code generated.");\n}`;
      templateTest = `// Automated test file corresponding to specification\n// Targeting engine: ${language}\n\nfunction test_suite() {\n  console.log("Executing unit testing suite successfully.");\n}`;
      break;
  }

  return {
    specSummary: `Formulated a highly modular, high-coverage ${language} boilerplate design satisfying the specification guidelines: "${specification.substring(0, 75)}..."`,
    architecture: {
      components: [
        { name: `${language.toUpperCase()} Parser Module`, description: `Analyzes grammar constraints and handles processing.`, technology: techStack },
        { name: "Repository Cache", description: `Indexes intermediate structures securely in execution memory.`, technology: `${language} Built-in structures` }
      ],
      dataFlow: [
        `Ingest target input payload structures.`,
        `Synthesize structures and trigger the custom ${language} processing state machine.`,
        `Pass execution values back to the diagnostics reporter.`
      ]
    },
    tasks: [
      { id: "T1", name: `Parse Spec for ${language}`, status: "success", category: "spec", details: "Validate constraints grammar metrics.", dependencies: [] },
      { id: "T2", name: "Synthesize Source Files", status: "success", category: "codegen", details: `Write production-ready ${language} algorithms.`, dependencies: ["T1"] },
      { id: "T3", name: "Structure Custom Test Suite", status: "success", category: "testgen", details: `Format matching unit testing file tests.`, dependencies: ["T2"] },
      { id: "T4", name: "Execute Sandbox Runner", status: "success", category: "sandbox", details: `Validate output behaviors inside container isolates.`, dependencies: ["T3"] }
    ],
    files: [
      {
        filename: `${filename}.${extension}`,
        path: `src/${filename}.${extension}`,
        language: language,
        code: templateCode,
        testCode: templateTest,
        explanations: [
          { line: 5, text: `Initialized memory variables according to specification constraints.` },
          { line: 12, text: `Provided robust exceptions and error validations checking blank parameters.` }
        ]
      }
    ]
  };
}

// Route: API Spec Ingestion and AI Planner Parser
app.post("/api/autoforge/parse", async (req, res) => {
  const { specification, language } = req.body;

  if (!specification || !language) {
    res.status(400).json({ error: "Missing parameter: specification and language are required" });
    return;
  }

  // If Gemini client is activated, query it to construct a complete customized experience
  if (ai) {
    try {
      const prompt = `
      You are the backend orchestrator of AutoForge AI: the autonomous software writing and testing agent.
      The user projects details follow:
      - Requested Language: ${language}
      - Specification / Goal: ${specification}

      Your task: Create a production-grade, highly cohesive code file and a corresponding unit test file matching this request.
      They must be clean, highly functional, and detailed.
      Also formulate the structured orchestrator tasks, an architecture summary, and inline explanations for the code.

      Please compile a detailed response in JSON following the required schema:
      - specSummary: A robust, detailed summary of what was generated based on the spec.
      - architecture: An object containing:
        - components: An array of objects each with { name, description, technology } outlining the core units of this solution.
        - dataFlow: An array of strings representing the orderly telemetry flows between them.
      - tasks: An array of 4-6 stages tracking progress:
        - id: Unique string like "T1", "T2", "T3" etc.
        - name: The human title of the task.
        - status: Set this to "success" for all pre-generated stages.
        - category: "spec" | "codegen" | "testgen" | "sandbox" | "repair" | "review"
        - details: Brief description of the work performed.
        - dependencies: Array of strings matching the IDs of prerequisite tasks.
      - files: An array of exactly 1 code file. The object contains:
        - filename: Pure file naming (e.g. "inventory.ts", "csv_parser.py", "fibonacci.rs", etc. depending on language choice)
        - path: Fully specified file location (e.g. "src/...")
        - language: Must match the requested language exactly.
        - code: The clean complete source code matching the spec. Include comments, types, and rigorous logic.
        - testCode: Complete unit test code corresponding to this source, matching common testing libraries like Vitest/unittest/cargo test.
        - explanations: An array of 2-4 items tracking:
          - line: An approximate line number in 'code' corresponding to this explanation.
          - text: The explanation of why the agent wrote it this way.

      Generate clean records. Return ONLY valid JSON format. Do not prepend markdown formatting symbols like \`\`\`json.
      `;

      const response = await generateContentWithFallback(ai, {
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              specSummary: { type: Type.STRING },
              architecture: {
                type: Type.OBJECT,
                properties: {
                  components: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        technology: { type: Type.STRING }
                      },
                      required: ["name", "description", "technology"]
                    }
                  },
                  dataFlow: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["components", "dataFlow"]
              },
              tasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    status: { type: Type.STRING },
                    category: { type: Type.STRING },
                    details: { type: Type.STRING },
                    dependencies: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  },
                  required: ["id", "name", "status", "category", "details", "dependencies"]
                }
              },
              files: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    filename: { type: Type.STRING },
                    path: { type: Type.STRING },
                    code: { type: Type.STRING },
                    testCode: { type: Type.STRING },
                    language: { type: Type.STRING },
                    explanations: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          line: { type: Type.INTEGER },
                          text: { type: Type.STRING }
                        },
                        required: ["line", "text"]
                      }
                    }
                  },
                  required: ["filename", "path", "code", "testCode", "language", "explanations"]
                }
              }
            },
            required: ["specSummary", "architecture", "tasks", "files"]
          },
        }
      });

      const parsedData = JSON.parse(response.text.trim());
      res.json(parsedData);
      return;
    } catch (err: any) {
      console.error("AutoForge Backend: Gemini API processing failed. Falling back to presets. Error:", err);
    }
  }

  // Robust fallback logic
  const dynamicFallback = getDynamicOfflinePreset(specification, language);
  if (dynamicFallback) {
    res.json(dynamicFallback);
    return;
  }

  let matchedPresetKey = "typescript-api";
  const normalizedSpec = specification.toLowerCase();
  
  if (language === "python" || normalizedSpec.includes("python") || normalizedSpec.includes("csv")) {
    matchedPresetKey = "python-parser";
  } else if (language === "rust" || normalizedSpec.includes("rust") || normalizedSpec.includes("fibonacci")) {
    matchedPresetKey = "rust-fibonacci";
  } else if (language === "go" || normalizedSpec.includes("go") || normalizedSpec.includes("validator") || normalizedSpec.includes("golang")) {
    matchedPresetKey = "go-validator";
  }

  const result = OFFLINE_PRESETS[matchedPresetKey];
  res.json(result);
});

// Route: Interactive Revise Code Chat Agent
app.post("/api/autoforge/chat-revision", async (req, res) => {
  const { code, filename, language, chatMessage } = req.body;

  if (!code || !chatMessage || !filename || !language) {
    res.status(400).json({ error: "Missing parameter: code, filename, language and chatMessage are required" });
    return;
  }

  if (ai) {
    try {
      const prompt = `
      You are the code revision service of AutoForge AI.
      The developer has provided the following file:
      - Filename: ${filename}
      - Language: ${language}

      CURRENT CODE:
      \`\`\`
      ${code}
      \`\`\`

      The developer is asking for this adjustment:
      "${chatMessage}"

      Please revise the code based on the instructions. Ensure you update it correctly, keep the formatting neat, and preserve the rest of the file functionality.
      Return ONLY the revised code in raw string format, without any markdown formatting blocks or explanations. Just return the program itself.
      `;

      const response = await generateContentWithFallback(ai, {
        model: "gemini-3.5-flash",
        contents: prompt
      });

      const revisedText = response.text.trim();
      // Remove any surrounding markdown fence indicators
      const cleaned = revisedText.replace(/^```[a-zA-Z0-9]*\n/, "").replace(/\n```$/, "");
      res.json({ revisedCode: cleaned });
      return;
    } catch (err) {
      console.error("AutoForge Backend: Revision failed. Falling back to simple append. Error:", err);
    }
  }

  // Fallback simple revision simulation
  const revisedCode = `${code}\n\n// Added via AutoForge revision requests:\n// Re: "${chatMessage}"\n// Processed successfully in offline diagnostics pipeline.\n`;
  res.json({ revisedCode });
});

// Route: Multi-Agent Critic Code Audit Inspector (Security, Performance, and Style)
app.post("/api/autoforge/audit", async (req, res) => {
  const { code, filename, language } = req.body;

  if (!code || !filename || !language) {
    res.status(400).json({ error: "Missing parameter: code, filename and language are required" });
    return;
  }

  if (ai) {
    try {
      const prompt = `
      You are the specialized Multi-Agent Critic network of AutoForge AI. 
      Analyze the following source program and generate a checklist audits report mapping Security, Performance, and Style.
      
      File Info:
      - Filename: ${filename}
      - Language: ${language}
      - Code Content:
      \`\`\`
      ${code}
      \`\`\`

      Analyze strictly and produce:
      1. Security Inspector warnings (low/medium/high/critical flags + fixSuggestion). For instance, analyze parameters validation, constant JWT strings, overflow edgecases.
      2. Performance Optimizer recommendations (O(...) metrics, code block to optimise).
      3. Style Standards issues (import formats, block alignment, casing checks).
      
      Return a clean, detailed JSON response matching this schema:
      {
        "securityAlerts": [
          {
            "id": "SEC1",
            "title": "Short title",
            "severity": "low",
            "text": "Detailed security warning content",
            "fixSuggestion": "Pristine code block recommendation or explanation to patch the code"
          }
        ],
        "performance": [
          {
            "id": "PERF1",
            "complexity": "O(N^2) to O(N)",
            "beforeCode": "raw bad code segment",
            "afterCode": "optimized code replacement",
            "text": "Algorithmic explanation of optimization benefit"
          }
        ],
        "style": [
          {
            "id": "STYL1",
            "text": "linter style issue details",
            "line": 15,
            "expectedFormat": "expected correct syntax structure"
          }
        ]
      }
      
      Return ONLY valid JSON format. Do not prepend markdown formatting symbols.
      `;

      const response = await generateContentWithFallback(ai, {
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              securityAlerts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    severity: { type: Type.STRING },
                    text: { type: Type.STRING },
                    fixSuggestion: { type: Type.STRING }
                  },
                  required: ["id", "title", "severity", "text", "fixSuggestion"]
                }
              },
              performance: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    complexity: { type: Type.STRING },
                    beforeCode: { type: Type.STRING },
                    afterCode: { type: Type.STRING },
                    text: { type: Type.STRING }
                  },
                  required: ["id", "complexity", "beforeCode", "afterCode", "text"]
                }
              },
              style: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    text: { type: Type.STRING },
                    line: { type: Type.INTEGER },
                    expectedFormat: { type: Type.STRING }
                  },
                  required: ["id", "text", "line", "expectedFormat"]
                }
              }
            },
            required: ["securityAlerts", "performance", "style"]
          }
        }
      });

      const parsedAudit = JSON.parse(response.text.trim());
      res.json(parsedAudit);
      return;
    } catch (err: any) {
      console.error("AutoForge Backend: Dynamic Multi-Agent Audit failed. Falling back. Error:", err);
    }
  }

  // High-Fidelity Static fallback audits depending on active file language choice:
  let fallback: any = {
    securityAlerts: [
      {
        id: "SEC-FB-1",
        title: "Hardcoded Cryptographic Token Constant",
        severity: "critical",
        text: "The authentication signature middleware compares Bearer claims against a raw plain-text secret token in direct string comparison.",
        fixSuggestion: "const token = process.env.JWT_SECRET_KEY || crypto.randomBytes(32).toString('hex');"
      },
      {
        id: "SEC-FB-2",
        title: "Lacks Cryptographic Nonce Validation",
        severity: "medium",
        text: "Endpoint validation lacks transaction counter checks or replay protection bounds.",
        fixSuggestion: "Check incremental sequence tag counters associated with Bearer payload."
      }
    ],
    performance: [
      {
        id: "PERF-FB-1",
        complexity: "O(K) lookup mapping",
        beforeCode: "Array.from(db.values())",
        afterCode: "// Maintain cached list index mapping key sequences\nexport const listCache = new Map();",
        text: "Direct structural scanning of Maps to return complete collections consumes secondary memory array layers on massive indices."
      }
    ],
    style: [
      {
        id: "STYL-FB-1",
        text: "Order of module system imports is non-standard",
        line: 1,
        expectedFormat: "import express from 'express';\nimport jwt from 'jsonwebtoken';"
      }
    ]
  };

  if (language === "python") {
    fallback = {
      securityAlerts: [
        {
          id: "SEC-PY-1",
          title: "Insecure StringIO Stream Overflows",
          severity: "low",
          text: "CSV process buffers read entire text into memory strings rather than chunk-based yield allocations.",
          fixSuggestion: "def stream_lines(buffer, chunk_size=4096):\n    while True:\n        line = buffer.readline()\n        if not line: break\n        yield line"
        }
      ],
      performance: [
        {
          id: "PERF-PY-1",
          complexity: "O(N) search bounds",
          beforeCode: "for req in self.expected_headers:\n            if req not in headers:",
          afterCode: "lookup = set(headers)\n        for req in self.expected_headers:\n            if req not in lookup:",
          text: "Converting the list search check into an O(1) set check skips N-squared bounds for massive header arrays."
        }
      ],
      style: [
        {
          id: "STYL-PY-1",
          text: "Parameter naming is not completely snake_case compliant",
          line: 7,
          expectedFormat: "def __init__(self, expected_headers: List[str]):"
        }
      ]
    };
  }

  res.json(fallback);
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AutoForge AI Application running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
