# frozen_string_literal: true

require "rails_helper"

RSpec.describe PurgeOldTicketExportsJob, type: :job do
  it "destroys exports older than the retention period and removes blobs" do
    old = create(:ticket_export, :ready)
    old_blob_id = old.file.blob.id
    old.update_columns(created_at: 8.days.ago)

    recent = create(:ticket_export, :ready)

    expect { described_class.perform_now }.to change(TicketExport, :count).by(-1)

    expect(TicketExport.exists?(old.id)).to be false
    expect(TicketExport.exists?(recent.id)).to be true
    expect(ActiveStorage::Blob.exists?(old_blob_id)).to be false
  end

  it "keeps exports right at the retention boundary" do
    export = create(:ticket_export, :ready)
    export.update_columns(created_at: 7.days.ago + 1.minute)

    expect { described_class.perform_now }.not_to change(TicketExport, :count)
  end
end
