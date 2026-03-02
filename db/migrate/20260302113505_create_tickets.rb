class CreateTickets < ActiveRecord::Migration[8.0]
  def change
    create_table :tickets do |t|
      t.references :customer, null: false, foreign_key: { to_table: :users }
      t.references :assigned_agent, null: true, foreign_key: { to_table: :users }
      t.string :subject, null: false
      t.text :description, null: false
      t.integer :status, default: 0, null: false

      t.timestamps
    end
  end
end
