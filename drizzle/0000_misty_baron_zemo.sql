CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"source_id" integer,
	"external_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "keywords" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"word" text NOT NULL,
	"frequency" integer NOT NULL,
	"positive_sentiment_document_count" integer NOT NULL,
	"neutral_sentiment_document_count" integer NOT NULL,
	"negative_sentiment_document_count" integer NOT NULL,
	CONSTRAINT "keywords_word_unique" UNIQUE("word")
);
--> statement-breakpoint
CREATE TABLE "keywords_to_documents" (
	"keyword_id" integer NOT NULL,
	"document_id" integer NOT NULL,
	CONSTRAINT "keywords_to_documents_keyword_id_document_id_pk" PRIMARY KEY("keyword_id","document_id")
);
--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "keywords_to_documents" ADD CONSTRAINT "keywords_to_documents_keyword_id_keywords_id_fk" FOREIGN KEY ("keyword_id") REFERENCES "public"."keywords"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "keywords_to_documents" ADD CONSTRAINT "keywords_to_documents_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "external_id_idx" ON "documents" USING btree ("external_id");