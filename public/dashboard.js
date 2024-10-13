import { showLoading, hideLoading } from './js/loadingIndicator.js';
import { initializeModalManagement } from './js/modalManagement.js';
import { initializeFormSubmission } from './js/formSubmission.js';
import { initializeTaskEventHandlers } from './js/taskEventHandlers.js';
import { initializeContactSuggestions } from './js/contactSuggestions.js';
import { loadTasks } from './js/taskLoading.js';
import { initializeAISearch } from './js/aiSearch.js';
import { initializeVoiceCommandModal } from './js/voiceCommandModal.js';
import { openContactChatWindow } from './contactChatbot.js';
import { initializeAIActions } from './js/aiActions.js';
import { initializeEmailTemplateAction } from './js/emailTemplateAction.js';
import './js/emailAction.js';
import './js/noteAction.js';
import './js/smsAction.js';
import './js/createContactForm.js';
import { initializeContactCard } from './js/contactCard.js';
import { openMatchupChatWindow } from './contactChatbot.js';

document.addEventListener('DOMContentLoaded', async function() {
    console.log("DOM fully loaded and parsed");

    showLoading();
    await loadTasks();
    hideLoading();

    initializeModalManagement();
    initializeFormSubmission();
    initializeTaskEventHandlers(); // This should now be called after loadTasks
    initializeContactSuggestions();
    initializeAISearch();
    initializeVoiceCommandModal();
    initializeAIActions();
    initializeEmailTemplateAction();
    initializeContactCard();

    
});
