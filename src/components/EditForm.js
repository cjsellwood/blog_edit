import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

const EditForm = (props) => {
  const { id } = useParams();
  useEffect(() => {
    props.startEditing(id);
  }, []);

  return (
    <div className="NewForm">
      <h1 className="title">Edit Blog Post</h1>
      <form
        className="form"
        onSubmit={props.handleEditSubmit}
        data-id={id}
      >
        <div>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            placeholder="Title"
            name="title"
            id="title"
            onChange={props.handleEditInput}
            value={props.editPost.title}
          />
        </div>
        <div>
          <label htmlFor="text">Content</label>
          <textarea
            placeholder="Content"
            name="text"
            id="text"
            rows="20"
            onChange={props.handleEditInput}
            value={props.editPost.text}
          ></textarea>
        </div>
        <div className="radio">
          <p>Publish Now?</p>
          <input
            type="radio"
            id="publish"
            name="published"
            value="true"
            onChange={props.handleEditInput}
            checked={props.editPost.published}
          />
          <label htmlFor="publish">Yes</label>
          <br></br>
          <input
            type="radio"
            id="unpublish"
            name="published"
            value="false"
            onChange={props.handleEditInput}
            checked={!props.editPost.published}
          />
          <label htmlFor="unpublish">No</label>
        </div>
        <button>Submit</button>
      </form>
    </div>
  );
};

export default EditForm;
