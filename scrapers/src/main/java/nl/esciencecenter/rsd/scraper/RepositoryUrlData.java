package nl.esciencecenter.rsd.scraper;

import java.time.LocalDateTime;

public record RepositoryUrlData(String id, String url, LocalDateTime lastUpdated) {
}