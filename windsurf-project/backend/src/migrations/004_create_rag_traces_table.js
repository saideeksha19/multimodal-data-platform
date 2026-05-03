/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('rag_traces', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('pipeline_id').references('id').inTable('pipelines').onDelete('CASCADE');
    table.text('query').notNullable();
    table.json('retrieval'); // chunks, relevance, sources
    table.text('response');
    table.decimal('confidence', 5, 4); // 0-1 confidence score
    table.boolean('hallucination').defaultTo(false);
    table.decimal('factuality', 5, 4); // factuality score
    table.string('status').defaultTo('success'); // success, hallucination, retrieval_failure, context_overflow
    table.json('embedding'); // query embedding vector
    table.json('retrieved_chunks'); // array of retrieved chunks
    table.json('sources'); // source documents
    table.decimal('retrieval_time', 8, 3); // time in milliseconds
    table.decimal('generation_time', 8, 3); // time in milliseconds
    table.json('error_details');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['user_id']);
    table.index(['pipeline_id']);
    table.index(['status']);
    table.index(['hallucination']);
    table.index(['created_at']);
    
    // Full-text search index
    table.index(['query'], 'rag_traces_query_fulltext', { type: 'fulltext' });
    table.index(['response'], 'rag_traces_response_fulltext', { type: 'fulltext' });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('rag_traces');
};
