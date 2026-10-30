# Brand components

The swemre brand components are defined in SWEPress under Settings → Components. A component
block reaches the site as an ordinary body block whose `type` is the name without the `swemre/`
prefix, with the fields below as its `props`. The renderers are in `src/templates/body/brand.tsx`,
the types in `src/contract/blocks.ts`. Every component has no children and is allowed on the
project content type.

On a project page, a section with `architecture` or `subpages` runs full width; `cta` goes to the
left column; the `prompt` of `coverage` or `subpages` is drawn in the section header; plain
images (not `card`) follow the section as screenshots, the first one in a browser frame labelled
with the host of the project's `url`. `hue` on an architecture box defaults to the section hue
(`peri` for the first column).

The `/contact` and `/call-back` forms take text and option values from the query string
(`/contact?message=…`), so a `cta` can open a filled-in form.

## swemre/architecture

Label: Architecture diagram. Children: none.

```json
{
  "type": "object",
  "properties": {
    "link": {
      "type": "object",
      "properties": {
        "label": {
          "type": "string"
        },
        "href": {
          "type": "string"
        }
      },
      "required": ["label", "href"]
    },
    "flow": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "label": {
            "type": "string"
          },
          "items": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "title": {
                  "type": "string"
                },
                "copy": {
                  "type": "string"
                },
                "tag": {
                  "type": "string"
                },
                "code": {
                  "type": "string"
                },
                "chips": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                "hue": {
                  "type": "string",
                  "enum": ["sky", "blue", "peri", "lilac", "mist", "aqua"]
                }
              },
              "required": ["title"]
            },
            "minItems": 1
          }
        },
        "required": ["label", "items"]
      },
      "minItems": 2,
      "maxItems": 4
    },
    "footnote": {
      "type": "string"
    },
    "layersTitle": {
      "type": "string"
    },
    "layers": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "label": {
            "type": "string"
          },
          "items": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "title": {
                  "type": "string"
                },
                "copy": {
                  "type": "string"
                },
                "tag": {
                  "type": "string"
                },
                "code": {
                  "type": "string"
                },
                "chips": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                "hue": {
                  "type": "string",
                  "enum": ["sky", "blue", "peri", "lilac", "mist", "aqua"]
                }
              },
              "required": ["title"]
            },
            "minItems": 1,
            "maxItems": 3
          }
        },
        "required": ["label", "items"]
      }
    }
  },
  "required": ["flow", "layers"]
}
```

## swemre/subpages

Label: Project pages. Children: none.

```json
{
  "type": "object",
  "properties": {
    "prompt": {
      "type": "string"
    },
    "cwd": {
      "type": "string"
    },
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "title": {
            "type": "string"
          },
          "copy": {
            "type": "string"
          },
          "path": {
            "type": "string"
          },
          "href": {
            "type": "string"
          },
          "icon": {
            "type": "string",
            "enum": [
              "layers",
              "commit",
              "check-circle",
              "package",
              "grid",
              "map",
              "file-text",
              "code",
              "book",
              "shield",
              "globe",
              "inbox"
            ]
          },
          "soon": {
            "type": "boolean"
          }
        },
        "required": ["title", "copy", "path"]
      },
      "minItems": 1
    }
  },
  "required": ["items"]
}
```

## swemre/repos

Label: Repositories. Children: none.

```json
{
  "type": "object",
  "properties": {
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "role": {
            "type": "string"
          },
          "version": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "copy": {
            "type": "string"
          },
          "href": {
            "type": "string"
          }
        },
        "required": ["role", "version", "name", "copy"]
      },
      "minItems": 1
    }
  },
  "required": ["items"]
}
```

## swemre/coverage

Label: Test coverage. Children: none.

```json
{
  "type": "object",
  "properties": {
    "prompt": {
      "type": "string"
    },
    "cwd": {
      "type": "string"
    },
    "label": {
      "type": "string"
    },
    "badge": {
      "type": "string"
    },
    "totals": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "label": {
            "type": "string"
          },
          "value": {
            "type": "number"
          },
          "copy": {
            "type": "string"
          }
        },
        "required": ["label", "value", "copy"]
      },
      "minItems": 1,
      "maxItems": 4
    },
    "rows": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "tools": {
            "type": "string"
          },
          "unit": {
            "type": "number"
          },
          "component": {
            "type": "number"
          },
          "e2e": {
            "type": "number"
          },
          "coverage": {
            "type": "number",
            "minimum": 0,
            "maximum": 100
          }
        },
        "required": ["name", "tools", "coverage"]
      }
    },
    "footnote": {
      "type": "string"
    },
    "link": {
      "type": "object",
      "properties": {
        "label": {
          "type": "string"
        },
        "href": {
          "type": "string"
        }
      },
      "required": ["label", "href"]
    }
  },
  "required": ["label", "totals", "rows"]
}
```

## swemre/steps

Label: Steps. Children: none.

```json
{
  "type": "object",
  "properties": {
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "title": {
            "type": "string"
          },
          "copy": {
            "type": "string"
          }
        },
        "required": ["title", "copy"]
      },
      "minItems": 1
    }
  },
  "required": ["items"]
}
```

## swemre/cta

Label: Call to action. Children: none.

```json
{
  "type": "object",
  "properties": {
    "label": {
      "type": "string"
    },
    "href": {
      "type": "string"
    },
    "note": {
      "type": "string"
    }
  },
  "required": ["label", "href"]
}
```

## swemre/prefill

Label: Prefilled form. Children: none.

```json
{
  "type": "object",
  "properties": {
    "title": {
      "type": "string"
    },
    "path": {
      "type": "string"
    },
    "facts": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "label": {
            "type": "string"
          },
          "value": {
            "type": "string"
          }
        },
        "required": ["label", "value"]
      },
      "minItems": 1
    },
    "note": {
      "type": "string"
    }
  },
  "required": ["title", "path", "facts"]
}
```
