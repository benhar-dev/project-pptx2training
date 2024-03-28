using System;
using System.IO;
using Microsoft.Office.Core;
using Microsoft.Office.Interop.PowerPoint;
using Application = Microsoft.Office.Interop.PowerPoint.Application;

class Program
{
    static void Main(string[] args)
    {
        Application pptApplication = new Application();
        Presentations presentations = pptApplication.Presentations;
        Presentation originalPresentation = presentations.Open("C:\\Temp\\test.pptx", WithWindow: MsoTriState.msoFalse);

        string tempPresentationPath = "C:\\Temp\\temp.pptx";
        string outputVideoPathTemplate = "C:\\Temp\\slide_{0}.mp4";

        try
        {
            for (int i = 1; i <= originalPresentation.Slides.Count; i++)
            {
                // Create a copy of the original presentation
                originalPresentation.SaveCopyAs(tempPresentationPath, PpSaveAsFileType.ppSaveAsDefault);
                Presentation tempPresentation = presentations.Open(tempPresentationPath, WithWindow: MsoTriState.msoTrue);

                // Delete all slides except the current one
                for (int j = tempPresentation.Slides.Count; j > 0; j--)
                {
                    if (j != i)
                    {
                        tempPresentation.Slides[j].Delete();
                    }
                }

                // Export the current slide as a video
                string outputVideoPath = string.Format(outputVideoPathTemplate, i);
                //tempPresentation.Export(outputVideoPath, "MP4");
                tempPresentation.CreateVideo(outputVideoPath);
                tempPresentation.Close();

                Console.WriteLine($"Exported slide {i} successfully.");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error during export: " + ex.Message);
        }
        finally
        {
            // Cleanup
            if (File.Exists(tempPresentationPath))
            {
                File.Delete(tempPresentationPath);
            }
            originalPresentation.Close();
            pptApplication.Quit();
        }
    }
}
