# PDF Auto Extract Limits

The Product Catalog PDF auto-extract flow accepts PDF files up to 50 MB.

- Supabase bucket `policy-documents`: 50 MB per-file limit.
- Admin validation: 50 MB.
- `product-catalog-extract` Edge Function: 50 MB.
- For large files, processing can take longer because the PDF is read and sent to the model for extraction.
- AI output remains Draft only. Advisor verification is still required before the product becomes usable by recommendation flows.

If the project-level Supabase Storage global limit is configured below 50 MB, that global setting will still take precedence and must be raised in Storage Settings.
