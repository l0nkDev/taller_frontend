import { useState, useRef } from 'react';
import { useParseOrderAIMutation } from '../../../api/floorApi';
import { TableRead } from '../../../api/floorApi';

export const useAIAssistant = (
  dishes: any[],
  setDishesMap: React.Dispatch<React.SetStateAction<Record<number, { dish: any; quantity: number }>>>
) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [aiText, setAiText] = useState("");
  const [parseOrderAI, { isLoading: isParsingAI }] = useParseOrderAIMutation();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", audioBlob, "order.webm");
        
        try {
          const res = await parseOrderAI(formData).unwrap();
          if (res) {
             if (res.transcription) {
                 setAiText(res.transcription);
             }
             if (res.items) {
                 res.items.forEach((item: any) => {
                    const dishObj = dishes?.find((d: any) => d.id === item.dish_id);
                    if (dishObj) {
                      setDishesMap(prev => {
                         const existing = prev[item.dish_id];
                         return {
                           ...prev,
                           [item.dish_id]: {
                             dish: dishObj,
                             quantity: existing ? existing.quantity + item.quantity : item.quantity
                           }
                         };
                      });
                    }
                 });
             }
          }
        } catch (e) {
          console.error("AI Parse Error", e);
        }
        
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSendAIText = async () => {
    if (!aiText.trim()) return;
    const formData = new FormData();
    formData.append("text", aiText);
    setAiText("");
    try {
       const res = await parseOrderAI(formData).unwrap();
       if (res && res.items) {
          res.items.forEach(item => {
             const dishObj = dishes?.find((d: any) => d.id === item.dish_id);
             if (dishObj) {
               setDishesMap(prev => {
                  const existing = prev[item.dish_id];
                  return {
                    ...prev,
                    [item.dish_id]: {
                      dish: dishObj,
                      quantity: existing ? existing.quantity + item.quantity : item.quantity
                    }
                  };
               });
             }
          });
       }
    } catch(e) {
       console.error("AI Text Parse Error", e);
    }
  };

  return {
    isRecording,
    aiText,
    setAiText,
    isParsingAI,
    startRecording,
    stopRecording,
    handleSendAIText
  };
};
