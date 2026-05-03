/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('pipelines', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('dataset_id').references('id').inTable('datasets').onDelete('CASCADE');
    table.string('name').notNullable();
    table.text('description');
    table.string('type').notNullable(); // data_cleaning, ocr_extraction, image_analysis, sentiment_analysis, rag_processing
    table.string('status').defaultTo('pending'); // pending, running, completed, failed, cancelled
    table.json('config'); // pipeline configuration
    table.json('input_data');
    table.json('output_data');
    table.json('steps'); // array of processing steps
    table.integer('current_step').defaultTo(0);
    table.integer('total_steps').defaultTo(0);
    table.decimal('progress', 5, 2).defaultTo(0); // percentage 0-100
    table.timestamp('started_at');
    table.timestamp('completed_at');
    table.timestamp('estimated_completion');
    table.text('error_message');
    table.json('metrics'); // processing metrics, performance data
    table.timestamps(true, true);
    
    // Indexes
    table.index(['user_id']);
    table.index(['dataset_id']);
    table.index(['status']);
    table.index(['type']);
    table.index(['started_at']);
    table.index(['completed_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('pipelines');
};
