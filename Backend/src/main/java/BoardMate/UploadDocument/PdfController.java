package BoardMate.UploadDocument;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/pdf")
public class PdfController {

    private final Path pdfPath = Paths.get(System.getProperty("user.dir"))
            .resolve("Camera")
            .resolve("SavedPDF")
            .resolve("output.pdf");

    @GetMapping(value = "/latest", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<Resource> getLatestPdf() {
        FileSystemResource resource = new FileSystemResource(pdfPath.toFile());

        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }
}