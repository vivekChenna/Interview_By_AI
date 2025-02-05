import { gql } from "@apollo/client";

export const saveUserQuestionAnswer = gql`
  mutation SaveQuestionAndAnswer(
    $candidateId: uuid!
    $question: String!
    $answer: String!
  ) {
    insert_Interview_responses_one(
      object: {
        candidate_id: $candidateId
        question: $question
        answer: $answer
      }
    ) {
      id
    }
  }
`;

export const updateCandidateScoreAndLinkUsed = gql`
  mutation updateUserScore($id: uuid!, $user_score: String!) {
    update_Candidate_by_pk(
      pk_columns: { id: $id }
      _set: { user_score: $user_score, is_link_used: true }
    ) {
      id
      user_score
      is_link_used
    }
  }
`;

export const getCandidateDetails = gql`
  query getCandidate($id: uuid!) {
    Candidate(where: { id: { _eq: $id } }) {
      id
      name
      email
      job_role
      link_expiration
      is_link_used
    }
  }
`;

export const updateTranscriptionWorking = gql`
  mutation UpdateTranscriptionWorking($id: uuid!, $isWorking: Boolean!) {
    update_Candidate_by_pk(
      pk_columns: { id: $id }
      _set: { is_transcription_working: $isWorking }
    ) {
      id
      is_transcription_working
    }
  }
`;
