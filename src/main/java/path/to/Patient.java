public class Patient {
    // Other fields
    private String email;
    private String cardId; // Added cardId field

    // Existing getter and setter for email
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    // New getter for cardId
    public String getCardId() {
        return cardId;
    }

    // New setter for cardId
    public void setCardId(String cardId) {
        this.cardId = cardId;
    }
}