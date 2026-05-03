/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('analytics', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('metric_type').notNullable(); // data_volume, processing_speed, error_rate, model_performance
    table.string('metric_name').notNullable();
    table.decimal('value', 15, 4);
    table.string('unit'); // bytes, records/min, percentage, seconds
    table.json('dimensions'); // additional dimensions for filtering
    table.timestamp('recorded_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['user_id']);
    table.index(['metric_type']);
    table.index(['metric_name']);
    table.index(['recorded_at']);
    
    // Composite index for time-series queries
    table.index(['metric_type', 'recorded_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('analytics');
};
