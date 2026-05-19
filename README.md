# React

A modern React-based project utilizing the latest frontend technologies and tools for building responsive web applications.

## 🚀 Features

- **React 18** - React version with improved rendering and concurrent features
- **Vite** - Lightning-fast build tool and development server
- **Redux Toolkit** - State management with simplified Redux setup
- **TailwindCSS** - Utility-first CSS framework with extensive customization
- **React Router v6** - Declarative routing for React applications
- **Data Visualization** - Integrated D3.js and Recharts for powerful data visualization
- **Form Management** - React Hook Form for efficient form handling
- **Animation** - Framer Motion for smooth UI animations
- **Testing** - Jest and React Testing Library setup

## 📋 Prerequisites

- Node.js (v14.x or higher)
- npm or yarn

## 🛠️ Installation

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
   
2. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

## 📁 Project Structure

```
react_app/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── styles/         # Global styles and Tailwind configuration
│   ├── App.jsx         # Main application component
│   ├── Routes.jsx      # Application routes
│   └── index.jsx       # Application entry point
├── .env                # Environment variables
├── index.html          # HTML template
├── package.json        # Project dependencies and scripts
├── tailwind.config.js  # Tailwind CSS configuration
└── vite.config.js      # Vite configuration
```

## 🧩 Adding Routes

To add new routes to the application, update the `Routes.jsx` file:

```jsx
import { useRoutes } from "react-router-dom";
import HomePage from "pages/HomePage";
import AboutPage from "pages/AboutPage";

const ProjectRoutes = () => {
  let element = useRoutes([
    { path: "/", element: <HomePage /> },
    { path: "/about", element: <AboutPage /> },
    // Add more routes as needed
  ]);

  return element;
};
```

## 🎨 Styling

This project uses Tailwind CSS for styling. The configuration includes:

- Forms plugin for form styling
- Typography plugin for text styling
- Aspect ratio plugin for responsive elements
- Container queries for component-specific responsive design
- Fluid typography for responsive text
- Animation utilities

## 📱 Responsive Design

The app is built with responsive design using Tailwind CSS breakpoints.


## 📦 Deployment

Build the application for production:

```bash
npm run build
```

## 🙏 Acknowledgments

- Built with [Rocket.new](https://rocket.new)
- Powered by React and Vite
- Styled with Tailwind CSS

{
  "openapi": "3.0.1",
  "info": {
    "title": "FATCA API",
    "version": "v1"
  },
  "paths": {
    "/api/ad-config/active": {
      "get": {
        "tags": [
          "AD Config"
        ],
        "parameters": [
          {
            "name": "organizationId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/ad-config": {
      "get": {
        "tags": [
          "AD Config"
        ],
        "parameters": [
          {
            "name": "organizationId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "post": {
        "tags": [
          "AD Config"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaCreateAdConfigRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaCreateAdConfigRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaCreateAdConfigRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/ad-config/{configId}": {
      "put": {
        "tags": [
          "AD Config"
        ],
        "parameters": [
          {
            "name": "configId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUpdateAdConfigRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUpdateAdConfigRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUpdateAdConfigRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "delete": {
        "tags": [
          "AD Config"
        ],
        "parameters": [
          {
            "name": "configId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/auth/login": {
      "post": {
        "tags": [
          "Authentication"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/LoginRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/LoginRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/LoginRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/auth/refresh": {
      "post": {
        "tags": [
          "Authentication"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/RefreshRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/RefreshRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/RefreshRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/auth/logout": {
      "post": {
        "tags": [
          "Authentication"
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/auth/profile": {
      "get": {
        "tags": [
          "Authentication"
        ],
        "parameters": [
          {
            "name": "userId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/auth/session": {
      "get": {
        "tags": [
          "Authentication"
        ],
        "parameters": [
          {
            "name": "userId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "refreshToken",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/cases/{caseId}/assign": {
      "put": {
        "tags": [
          "Cases"
        ],
        "parameters": [
          {
            "name": "caseId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaAssignCaseRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaAssignCaseRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaAssignCaseRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/cases/{caseId}/comments": {
      "post": {
        "tags": [
          "Cases"
        ],
        "parameters": [
          {
            "name": "caseId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaAddCaseCommentRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaAddCaseCommentRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaAddCaseCommentRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/cases": {
      "get": {
        "tags": [
          "Cases"
        ],
        "parameters": [
          {
            "name": "organizationId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "status",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "reportability",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "assigneeId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "searchTerm",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "page",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "pageSize",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/cases/{caseId}/status": {
      "put": {
        "tags": [
          "Cases"
        ],
        "parameters": [
          {
            "name": "caseId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUpdateCaseStatusRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUpdateCaseStatusRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUpdateCaseStatusRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/dashboard/activities": {
      "get": {
        "tags": [
          "Dashboard"
        ],
        "parameters": [
          {
            "name": "organizationId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "limit",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/dashboard/admin-metrics": {
      "get": {
        "tags": [
          "Dashboard"
        ],
        "parameters": [
          {
            "name": "organizationId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/dashboard/metrics": {
      "get": {
        "tags": [
          "Dashboard"
        ],
        "parameters": [
          {
            "name": "organizationId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/datasets": {
      "get": {
        "tags": [
          "Datasets"
        ],
        "parameters": [
          {
            "name": "organizationId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "reportingYear",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "searchTerm",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/datasets/{batchId}": {
      "delete": {
        "tags": [
          "Datasets"
        ],
        "parameters": [
          {
            "name": "batchId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "organizationId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "deletedBy",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/datasets/customers": {
      "get": {
        "tags": [
          "Datasets"
        ],
        "parameters": [
          {
            "name": "organizationId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "reportingYear",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "customerType",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "regimeType",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "searchTerm",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "page",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "pageSize",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/datasets/summary": {
      "get": {
        "tags": [
          "Datasets"
        ],
        "parameters": [
          {
            "name": "organizationId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "reportingYear",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "searchTerm",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/datasets/upload": {
      "post": {
        "tags": [
          "Datasets"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUploadDatasetRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUploadDatasetRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUploadDatasetRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/enrichment/cases": {
      "get": {
        "tags": [
          "Enrichment"
        ],
        "parameters": [
          {
            "name": "organizationId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "userId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "status",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "searchTerm",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "page",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "pageSize",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/enrichment/cases/{caseId}/details": {
      "get": {
        "tags": [
          "Enrichment"
        ],
        "parameters": [
          {
            "name": "caseId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/enrichment/cases/{caseId}/fields": {
      "post": {
        "tags": [
          "Enrichment"
        ],
        "parameters": [
          {
            "name": "caseId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUpdateEnrichmentFieldRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUpdateEnrichmentFieldRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUpdateEnrichmentFieldRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/enrichment/cases/{caseId}/notes": {
      "post": {
        "tags": [
          "Enrichment"
        ],
        "parameters": [
          {
            "name": "caseId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaAddEnrichmentNoteRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaAddEnrichmentNoteRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaAddEnrichmentNoteRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "get": {
        "tags": [
          "Enrichment"
        ],
        "parameters": [
          {
            "name": "caseId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/enrichment/cases/{caseId}/ready": {
      "put": {
        "tags": [
          "Enrichment"
        ],
        "parameters": [
          {
            "name": "caseId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/organizations/{organizationId}": {
      "get": {
        "tags": [
          "Organizations"
        ],
        "parameters": [
          {
            "name": "organizationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/regimes": {
      "get": {
        "tags": [
          "Regime & Segment Lookups"
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/regimes/segments": {
      "get": {
        "tags": [
          "Regime & Segment Lookups"
        ],
        "parameters": [
          {
            "name": "regimeCode",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/reporting/audit-summary": {
      "get": {
        "tags": [
          "Reporting"
        ],
        "parameters": [
          {
            "name": "organizationId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/reporting/export": {
      "get": {
        "tags": [
          "Reporting"
        ],
        "parameters": [
          {
            "name": "batchId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "organizationId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "exportFormat",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "requestedBy",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/reporting/jobs/{jobId}/approve": {
      "put": {
        "tags": [
          "Reporting"
        ],
        "parameters": [
          {
            "name": "jobId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/reporting/jobs": {
      "get": {
        "tags": [
          "Reporting"
        ],
        "parameters": [
          {
            "name": "organizationId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "page",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "pageSize",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "post": {
        "tags": [
          "Reporting"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaCreateReportingJobRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaCreateReportingJobRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaCreateReportingJobRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/reporting/years": {
      "get": {
        "tags": [
          "Reporting"
        ],
        "parameters": [
          {
            "name": "organizationId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/resources": {
      "get": {
        "tags": [
          "Resources"
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "post": {
        "tags": [
          "Resources"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaCreateResourceRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaCreateResourceRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaCreateResourceRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/resources/{resourceId}": {
      "put": {
        "tags": [
          "Resources"
        ],
        "parameters": [
          {
            "name": "resourceId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUpdateResourceRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUpdateResourceRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUpdateResourceRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "delete": {
        "tags": [
          "Resources"
        ],
        "parameters": [
          {
            "name": "resourceId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "deletedBy",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/resources/{resourceId}/history": {
      "get": {
        "tags": [
          "Resources"
        ],
        "parameters": [
          {
            "name": "resourceId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/resources/{resourceId}/restore/{historyId}": {
      "put": {
        "tags": [
          "Resources"
        ],
        "parameters": [
          {
            "name": "resourceId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "historyId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaRestoreResourceVersionRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaRestoreResourceVersionRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaRestoreResourceVersionRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/rules/{ruleSetId}/approve-workflow": {
      "put": {
        "tags": [
          "Rules"
        ],
        "parameters": [
          {
            "name": "ruleSetId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/rules/{ruleSetId}/conditions": {
      "get": {
        "tags": [
          "Rules"
        ],
        "parameters": [
          {
            "name": "ruleSetId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "post": {
        "tags": [
          "Rules"
        ],
        "parameters": [
          {
            "name": "ruleSetId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaCreateRuleConditionRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaCreateRuleConditionRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaCreateRuleConditionRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/rules/conditions/{conditionId}": {
      "put": {
        "tags": [
          "Rules"
        ],
        "parameters": [
          {
            "name": "conditionId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUpdateRuleConditionRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUpdateRuleConditionRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUpdateRuleConditionRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "delete": {
        "tags": [
          "Rules"
        ],
        "parameters": [
          {
            "name": "conditionId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/rules": {
      "get": {
        "tags": [
          "Rules"
        ],
        "parameters": [
          {
            "name": "organizationId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "regime",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "segmentId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "year",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "status",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "searchTerm",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "showRetired",
            "in": "query",
            "schema": {
              "type": "boolean"
            }
          },
          {
            "name": "page",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "pageSize",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "post": {
        "tags": [
          "Rules"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaCreateRuleSetRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaCreateRuleSetRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaCreateRuleSetRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/rules/{ruleSetId}": {
      "put": {
        "tags": [
          "Rules"
        ],
        "parameters": [
          {
            "name": "ruleSetId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUpdateRuleSetRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUpdateRuleSetRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUpdateRuleSetRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "delete": {
        "tags": [
          "Rules"
        ],
        "parameters": [
          {
            "name": "ruleSetId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/rules/{ruleSetId}/history/compare": {
      "get": {
        "tags": [
          "Rules"
        ],
        "parameters": [
          {
            "name": "ruleSetId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "v1",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "v2",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/rules/{ruleSetId}/history": {
      "get": {
        "tags": [
          "Rules"
        ],
        "parameters": [
          {
            "name": "ruleSetId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "changeType",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "changedBy",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "startDate",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "date-time"
            }
          },
          {
            "name": "endDate",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "date-time"
            }
          },
          {
            "name": "page",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "pageSize",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/rules/{ruleSetId}/history/modifiers": {
      "get": {
        "tags": [
          "Rules"
        ],
        "parameters": [
          {
            "name": "ruleSetId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "limit",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "offset",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/rules/{ruleSetId}/reject-workflow": {
      "put": {
        "tags": [
          "Rules"
        ],
        "parameters": [
          {
            "name": "ruleSetId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/rules/{ruleSetId}/retire": {
      "put": {
        "tags": [
          "Rules"
        ],
        "parameters": [
          {
            "name": "ruleSetId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaRetireRuleSetRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaRetireRuleSetRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaRetireRuleSetRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/rules/simulate": {
      "post": {
        "tags": [
          "Rules"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaSimulateRulesRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaSimulateRulesRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaSimulateRulesRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/rules/{ruleSetId}/submit": {
      "put": {
        "tags": [
          "Rules"
        ],
        "parameters": [
          {
            "name": "ruleSetId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/segments/{segmentId}/approve": {
      "put": {
        "tags": [
          "Segments"
        ],
        "parameters": [
          {
            "name": "segmentId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/segments": {
      "get": {
        "tags": [
          "Segments"
        ],
        "parameters": [
          {
            "name": "organizationId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "activeOnly",
            "in": "query",
            "schema": {
              "type": "boolean"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "post": {
        "tags": [
          "Segments"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaCreateSegmentConfigRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaCreateSegmentConfigRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaCreateSegmentConfigRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/segments/{segmentId}": {
      "put": {
        "tags": [
          "Segments"
        ],
        "parameters": [
          {
            "name": "segmentId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUpdateSegmentConfigRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUpdateSegmentConfigRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUpdateSegmentConfigRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "delete": {
        "tags": [
          "Segments"
        ],
        "parameters": [
          {
            "name": "segmentId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/segments/{segmentId}/reject": {
      "put": {
        "tags": [
          "Segments"
        ],
        "parameters": [
          {
            "name": "segmentId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/segments/{segmentId}/submit": {
      "put": {
        "tags": [
          "Segments"
        ],
        "parameters": [
          {
            "name": "segmentId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/submissions/{submissionId}/approve": {
      "put": {
        "tags": [
          "Submissions"
        ],
        "parameters": [
          {
            "name": "submissionId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/submissions": {
      "get": {
        "tags": [
          "Submissions"
        ],
        "parameters": [
          {
            "name": "organizationId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "status",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "dateFrom",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "date-time"
            }
          },
          {
            "name": "dateTo",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "date-time"
            }
          },
          {
            "name": "page",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "pageSize",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "post": {
        "tags": [
          "Submissions"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaInitiateSubmissionRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaInitiateSubmissionRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaInitiateSubmissionRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/submissions/{submissionId}/reject": {
      "put": {
        "tags": [
          "Submissions"
        ],
        "parameters": [
          {
            "name": "submissionId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/submissions/stats": {
      "get": {
        "tags": [
          "Submissions"
        ],
        "parameters": [
          {
            "name": "organizationId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "reportingYear",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/submissions/{submissionId}/status": {
      "put": {
        "tags": [
          "Submissions"
        ],
        "parameters": [
          {
            "name": "submissionId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUpdateSubmissionStatusRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUpdateSubmissionStatusRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUpdateSubmissionStatusRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/submissions/{submissionId}/submit": {
      "put": {
        "tags": [
          "Submissions"
        ],
        "parameters": [
          {
            "name": "submissionId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/activities": {
      "post": {
        "tags": [
          "Users & Roles"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaLogUserActivityRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaLogUserActivityRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaLogUserActivityRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/roles": {
      "get": {
        "tags": [
          "Users & Roles"
        ],
        "parameters": [
          {
            "name": "organizationId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "post": {
        "tags": [
          "Users & Roles"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaCreateRoleRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaCreateRoleRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaCreateRoleRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/roles/{roleId}": {
      "put": {
        "tags": [
          "Users & Roles"
        ],
        "parameters": [
          {
            "name": "roleId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUpdateRoleRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUpdateRoleRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUpdateRoleRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "delete": {
        "tags": [
          "Users & Roles"
        ],
        "parameters": [
          {
            "name": "roleId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/roles/{roleId}/permissions": {
      "put": {
        "tags": [
          "Users & Roles"
        ],
        "parameters": [
          {
            "name": "roleId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUpdateRolePermissionsRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUpdateRolePermissionsRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUpdateRolePermissionsRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "get": {
        "tags": [
          "Users & Roles"
        ],
        "parameters": [
          {
            "name": "roleId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/users": {
      "get": {
        "tags": [
          "Users & Roles"
        ],
        "parameters": [
          {
            "name": "organizationId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "page",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "pageSize",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "post": {
        "tags": [
          "Users & Roles"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaCreateUserRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaCreateUserRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaCreateUserRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/users/{userId}": {
      "put": {
        "tags": [
          "Users & Roles"
        ],
        "parameters": [
          {
            "name": "userId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUpdateUserRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUpdateUserRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/FatcaUpdateUserRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "delete": {
        "tags": [
          "Users & Roles"
        ],
        "parameters": [
          {
            "name": "userId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "FatcaAddCaseCommentRequest": {
        "type": "object",
        "properties": {
          "caseId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "comment": {
            "type": "string",
            "nullable": true
          },
          "createdBy": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "FatcaAddEnrichmentNoteRequest": {
        "type": "object",
        "properties": {
          "caseId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "note": {
            "type": "string",
            "nullable": true
          },
          "createdBy": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "FatcaAssignCaseRequest": {
        "type": "object",
        "properties": {
          "caseId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "assignedTo": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "FatcaCreateAdConfigRequest": {
        "type": "object",
        "properties": {
          "configId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "organizationId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "name": {
            "type": "string",
            "nullable": true
          },
          "domain": {
            "type": "string",
            "nullable": true
          },
          "tenantId": {
            "type": "string",
            "nullable": true
          },
          "clientId": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "FatcaCreateReportingJobRequest": {
        "type": "object",
        "properties": {
          "jobId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "organizationId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "reportingYear": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "createdBy": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "FatcaCreateResourceRequest": {
        "type": "object",
        "properties": {
          "resourceId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "title": {
            "type": "string",
            "nullable": true
          },
          "contentType": {
            "type": "string",
            "nullable": true
          },
          "body": {
            "type": "string",
            "nullable": true
          },
          "filePath": {
            "type": "string",
            "nullable": true
          },
          "createdBy": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "FatcaCreateRoleRequest": {
        "type": "object",
        "properties": {
          "roleId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "roleName": {
            "type": "string",
            "nullable": true
          },
          "description": {
            "type": "string",
            "nullable": true
          },
          "permissions": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "FatcaCreateRuleConditionRequest": {
        "type": "object",
        "properties": {
          "conditionId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "ruleSetId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "fieldName": {
            "type": "string",
            "nullable": true
          },
          "operator": {
            "type": "string",
            "nullable": true
          },
          "value": {
            "type": "string",
            "nullable": true
          },
          "sequence": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "FatcaCreateRuleSetRequest": {
        "type": "object",
        "properties": {
          "ruleSetId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "organizationId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "ruleName": {
            "type": "string",
            "nullable": true
          },
          "regime": {
            "type": "string",
            "nullable": true
          },
          "segment": {
            "type": "string",
            "nullable": true
          },
          "reportingYear": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "description": {
            "type": "string",
            "nullable": true
          },
          "createdBy": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "conditions": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "FatcaCreateSegmentConfigRequest": {
        "type": "object",
        "properties": {
          "segmentId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "organizationId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "segment": {
            "type": "string",
            "nullable": true
          },
          "entityName": {
            "type": "string",
            "nullable": true
          },
          "giin": {
            "type": "string",
            "nullable": true
          },
          "sponsorGIIN": {
            "type": "string",
            "nullable": true
          },
          "countryCode": {
            "type": "string",
            "nullable": true
          },
          "reportingType": {
            "type": "string",
            "nullable": true
          },
          "contactPerson": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "FatcaCreateUserRequest": {
        "type": "object",
        "properties": {
          "userId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "organizationId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "username": {
            "type": "string",
            "nullable": true
          },
          "fullName": {
            "type": "string",
            "nullable": true
          },
          "email": {
            "type": "string",
            "nullable": true
          },
          "passwordHash": {
            "type": "string",
            "nullable": true
          },
          "roleId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "isActive": {
            "type": "boolean",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "FatcaInitiateSubmissionRequest": {
        "type": "object",
        "properties": {
          "submissionId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "organizationId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "reportingYear": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "giinConfigId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "FatcaLogUserActivityRequest": {
        "type": "object",
        "properties": {
          "userId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "organizationId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "activityType": {
            "type": "string",
            "nullable": true
          },
          "description": {
            "type": "string",
            "nullable": true
          },
          "ipAddress": {
            "type": "string",
            "nullable": true
          },
          "userAgent": {
            "type": "string",
            "nullable": true
          },
          "details": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "FatcaRestoreResourceVersionRequest": {
        "type": "object",
        "properties": {
          "resourceId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "historyId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "changedBy": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "FatcaRetireRuleSetRequest": {
        "type": "object",
        "properties": {
          "ruleSetId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "retirementReason": {
            "type": "string",
            "nullable": true
          },
          "retiredBy": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "FatcaSimulateRulesRequest": {
        "type": "object",
        "properties": {
          "organizationId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "ruleSetId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "reportingYear": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "FatcaUpdateAdConfigRequest": {
        "type": "object",
        "properties": {
          "configId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "name": {
            "type": "string",
            "nullable": true
          },
          "domain": {
            "type": "string",
            "nullable": true
          },
          "tenantId": {
            "type": "string",
            "nullable": true
          },
          "clientId": {
            "type": "string",
            "nullable": true
          },
          "isActive": {
            "type": "boolean",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "FatcaUpdateCaseStatusRequest": {
        "type": "object",
        "properties": {
          "caseId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "status": {
            "type": "string",
            "nullable": true
          },
          "reviewedBy": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "FatcaUpdateEnrichmentFieldRequest": {
        "type": "object",
        "properties": {
          "caseId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "fieldName": {
            "type": "string",
            "nullable": true
          },
          "fieldValue": {
            "type": "string",
            "nullable": true
          },
          "updatedBy": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "FatcaUpdateResourceRequest": {
        "type": "object",
        "properties": {
          "resourceId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "title": {
            "type": "string",
            "nullable": true
          },
          "body": {
            "type": "string",
            "nullable": true
          },
          "isPublished": {
            "type": "boolean",
            "nullable": true
          },
          "changedBy": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "FatcaUpdateRolePermissionsRequest": {
        "type": "object",
        "properties": {
          "roleId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "permissions": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "FatcaUpdateRoleRequest": {
        "type": "object",
        "properties": {
          "roleId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "roleName": {
            "type": "string",
            "nullable": true
          },
          "description": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "FatcaUpdateRuleConditionRequest": {
        "type": "object",
        "properties": {
          "conditionId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "fieldName": {
            "type": "string",
            "nullable": true
          },
          "operator": {
            "type": "string",
            "nullable": true
          },
          "value": {
            "type": "string",
            "nullable": true
          },
          "sequence": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "FatcaUpdateRuleSetRequest": {
        "type": "object",
        "properties": {
          "ruleSetId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "ruleName": {
            "type": "string",
            "nullable": true
          },
          "description": {
            "type": "string",
            "nullable": true
          },
          "updatedBy": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "FatcaUpdateSegmentConfigRequest": {
        "type": "object",
        "properties": {
          "segmentId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "segment": {
            "type": "string",
            "nullable": true
          },
          "entityName": {
            "type": "string",
            "nullable": true
          },
          "giin": {
            "type": "string",
            "nullable": true
          },
          "sponsorGIIN": {
            "type": "string",
            "nullable": true
          },
          "countryCode": {
            "type": "string",
            "nullable": true
          },
          "reportingType": {
            "type": "string",
            "nullable": true
          },
          "contactPerson": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "FatcaUpdateSubmissionStatusRequest": {
        "type": "object",
        "properties": {
          "submissionId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "status": {
            "type": "string",
            "nullable": true
          },
          "responseMessage": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "FatcaUpdateUserRequest": {
        "type": "object",
        "properties": {
          "userId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "username": {
            "type": "string",
            "nullable": true
          },
          "fullName": {
            "type": "string",
            "nullable": true
          },
          "email": {
            "type": "string",
            "nullable": true
          },
          "roleId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "isActive": {
            "type": "boolean",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "FatcaUploadDatasetRequest": {
        "type": "object",
        "properties": {
          "batchId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "organizationId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "giinConfigId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "reportingYear": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "batchName": {
            "type": "string",
            "nullable": true
          },
          "uploadedBy": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "records": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "LoginRequest": {
        "type": "object",
        "properties": {
          "username": {
            "type": "string",
            "nullable": true
          },
          "password": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "RefreshRequest": {
        "type": "object",
        "properties": {
          "refreshToken": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      }
    },
    "securitySchemes": {
      "Bearer": {
        "type": "http",
        "description": "Enter 'Bearer {token}'",
        "scheme": "bearer",
        "bearerFormat": "JWT"
      }
    }
  },
  "security": [
    {
      "Bearer": [ ]
    }
  ]
}
Built with ❤️ on Rocket.new
