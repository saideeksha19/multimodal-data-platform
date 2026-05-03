/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('datasets', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('name').notNullable();
    table.text('description');
    table.string('type').notNullable(); // pdf, image, video, audio, text, code, mixed
    table.string('status').defaultTo('uploading'); // uploading, processing, completed, error
    table.bigInteger('file_size');
    table.integer('record_count').defaultTo(0);
    table.json('metadata'); // file metadata, processing info, etc.
    table.json('tags'); // array of tags
    table.boolean('starred').defaultTo(false);
    table.string('file_path');
    table.string('thumbnail_path');
    table.timestamp('last_modified');
    table.timestamp('processed_at');
    table.timestamps(true, true);
    
    // Indexes
    table.index(['user_id']);
    table.index(['status']);
    table.index(['type']);
    table.index(['starred']);
    table.index(['created_at']);
    table.index(['last_modified']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('datasets');
};
