import React from "react";
import { MdClose } from "react-icons/md";

const AttachmentList = ({
  attachments,
  fileNames,
  removeAttachment,
  removeFileName,
}) => {
  return (
    <div>
      {attachments.map((attachment, index) => (
        <div key={attachment} className="d-flex flex-row gap-1 ">
          <a href={attachment} target="_blank" rel="noopener noreferrer">
            {fileNames[index]}
          </a>
          {/* <p>{fileNames[index]}</p> */}
          {/* <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => {
              removeAttachment(index);
              removeFileName(index);
            }}
          >
            Reject
          </button> */}

          <MdClose
            className="mt-1 outline-danger"
            onClick={() => {
              removeAttachment(index);
              removeFileName(index);
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default AttachmentList;
