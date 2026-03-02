import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@apollo/client/react";
import { useNavigate, Link } from "react-router-dom";
import { CREATE_TICKET } from "../../graphql/mutations";
import { GET_TICKETS } from "../../graphql/queries";

const ACCEPT = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "application/pdf": [".pdf"],
};
const MAX_FILES = 5;
const MAX_SIZE_MB = 10;
const MAX_SIZE = MAX_SIZE_MB * 1024 * 1024;

export default function CreateTicket() {
  const [error, setError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const navigate = useNavigate();

  const [createTicket, { loading }] = useMutation(CREATE_TICKET, {
    refetchQueries: [{ query: GET_TICKETS }],
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPT,
    maxSize: MAX_SIZE,
    maxFiles: MAX_FILES,
    disabled: selectedFiles.length >= MAX_FILES,
    onDrop: (acceptedFiles) => {
      setError("");
      setSelectedFiles((prev) => [...prev, ...acceptedFiles].slice(0, MAX_FILES));
    },
    onDropRejected: (rejections) => {
      setError(rejections.length > 0
        ? `Some files were rejected. Only images (JPEG, PNG, GIF, WebP) and PDFs under ${MAX_SIZE_MB}MB are allowed.`
        : "");
    },
    onDropAccepted: () => setError(""),
  });

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.target);
    const subject = formData.get("subject");
    const description = formData.get("description");

    if (!subject || !description) return;

    try {
      const { data } = await createTicket({
        variables: {
          subject,
          description,
          attachments: selectedFiles.length > 0 ? selectedFiles : null,
        },
      });
      const result = data.createTicket;

      if (result.errors.length > 0) {
        setError(result.errors.join(", "));
        return;
      }

      navigate(`/tickets/${result.ticket.id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-[640px]">
      <Link to="/" className="inline-flex items-center gap-1 text-[13px] font-medium text-gray-500 hover:text-accent mb-4 no-underline">
        ← Back to conversations
      </Link>
      <h2 className="text-xl font-bold mb-5">New conversation</h2>

      {error && (
        <div className="bg-red-50 text-red-500 px-3.5 py-2.5 rounded-lg text-[13px] font-medium mb-4">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
            <input
              type="text"
              name="subject"
              placeholder="What do you need help with?"
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              name="description"
              placeholder="Describe your issue in detail..."
              rows={6}
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none resize-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Attachments</label>
            <p className="text-[13px] text-gray-500 mb-2">
              Drag and drop files here, or click to browse (max {MAX_FILES} files, {MAX_SIZE_MB}MB each)
            </p>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                selectedFiles.length >= MAX_FILES
                  ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                  : isDragActive
                    ? "border-accent bg-accent-light/30 cursor-pointer"
                    : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 cursor-pointer"
              }`}
            >
              <input {...getInputProps()} />
              <span className="text-[13px] text-gray-500">
                {selectedFiles.length >= MAX_FILES
                  ? "Maximum files reached. Remove files to add more."
                  : isDragActive
                    ? "Drop files here..."
                    : "Drop images or PDFs here, or click to select"}
              </span>
            </div>
            {selectedFiles.length > 0 && (
              <ul className="mt-3 space-y-2">
                {selectedFiles.map((file, i) => (
                  <li key={i} className="flex items-center gap-2 text-[13px] text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
                    <span className="truncate flex-1">{file.name}</span>
                    <span className="text-gray-400 text-xs shrink-0">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                      className="text-red-500 hover:text-red-600 font-medium shrink-0"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex gap-2.5 justify-end mt-2">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-accent hover:bg-accent-hover text-white font-semibold px-4 py-2 rounded-lg text-sm transition disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
