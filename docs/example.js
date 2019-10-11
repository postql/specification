const request = {
    // Data required by application unrelated to query
    // Subdocuments have separate application-defined schemas
  "meta": {
    "data": [
      {
        "$schema": "https://api.example.org/schemas/meta/session.json",
        "type": "jwt",
        "payload": "<some jwt token>"
      }
    ]
  },
  "query": {
    "options": {
      // Execute queries independently or in a transaction
      "transactional": false
    },
    "queries": [
      // Parameterized queries
      {
        "query": "select u.name, u.email from user u where u.user_id = :id and u.tenant_id = :tenant_id",
        "params": {
          "id": "123",
          "tenant_id": "456"
        }
      },
      {
        "query": "update user u set u.name = :name where u.user_id = :id",
        "params": {
          "id": "123",
          "name": "John"
        }
      }
    ]
  }
}

const response = {
  "$schema": "https://postql.org/schemas/postql/v0/response.json",
  "meta": {
    "data": [
      {
        "$schema": "https://api.example.org/schemas/meta/rate_limiting.json",
        "limit": 100,
        "remaining": 50,
        "retry_after": "2019-09-22T00:00:00.000Z"
      }
    ]
  },
  "reply": {
    "data": [
      // Since this was nontransactional, there may be a mixed
      // outcome per query
      {
        "outcome": "success",
        "aliases": {
          "u": "user"
        },
        "rows": [
          {
            "u": {
              "name": "<name>",
              "email": "<email>"
            }
          }
        ]
      },
      {
        "outcome": "failure",
        "aliases": {
          "u": "user"
        },
        "error": {
          "$schema": "https://postql.org/schemas/v0/failed_schema_validation_error.json",
          "code": "failed_schema_validation",
          "message": "Request query failed schema validation",
          "data": [
            {
              "rule": "minLength",
              "message": "must be at least 4 characters",
              "path": "/name",
              "schema": {
                "description": "User's name",
                "type": "string",
                "minLength": 4
              },
              "schema_uri": "https://api.example.org/schemas/models/user.json#/properties/name"
            }
          ]
        }
      }
    ]
  }
}
